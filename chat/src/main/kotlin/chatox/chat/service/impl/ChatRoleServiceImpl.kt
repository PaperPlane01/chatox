package chatox.chat.service.impl

import chatox.chat.api.request.CreateChatRoleRequest
import chatox.chat.api.request.UpdateChatRoleRequest
import chatox.chat.api.response.ChatRoleResponse
import chatox.chat.exception.ChatRoleNotFoundException
import chatox.chat.exception.metadata.ChatNotFoundException
import chatox.chat.mapper.ChatRoleMapper
import chatox.chat.model.Chat
import chatox.chat.model.ChatBlockingFeatureAdditionalData
import chatox.chat.model.ChatRole
import chatox.chat.model.LevelBasedFeatureAdditionalData
import chatox.chat.model.StandardChatRole
import chatox.chat.model.User
import chatox.chat.repository.mongodb.ChatParticipationRepository
import chatox.chat.repository.mongodb.ChatRoleRepository
import chatox.chat.repository.mongodb.ChatRoleTemplateRepository
import chatox.chat.security.AuthenticationFacade
import chatox.chat.service.ChatRoleService
import chatox.chat.util.NTuple2
import chatox.platform.cache.ReactiveCacheService
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.bson.types.ObjectId
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Service
class ChatRoleServiceImpl(
        private val chatParticipationRepository: ChatParticipationRepository,
        private val chatRoleRepository: ChatRoleRepository,
        private val chatRoleTemplateRepository: ChatRoleTemplateRepository,
        private val chatCacheWrapper: ReactiveRepositoryCacheWrapper<Chat, String>,
        private val chatRoleCacheService: ReactiveCacheService<ChatRole, String>,
        private val userCacheService: ReactiveRepositoryCacheWrapper<User, String>,
        private val chatRoleMapper: ChatRoleMapper,
        private val authenticationFacade: AuthenticationFacade
) : ChatRoleService {

    override fun getRoleOfUserInChat(userId: String, chatId: String): Mono<ChatRole> {
        return mono {
            val chatParticipation = chatParticipationRepository.findByChatIdAndUserIdAndDeletedFalse(chatId, userId).awaitFirstOrNull()
                    ?: return@mono Mono.empty<ChatRole>()
            val roleId = chatParticipation.roleId

            return@mono chatRoleCacheService.find(roleId)
        }
                .flatMap { it }
    }

    override fun findRoleByIdAndChatId(roleId: String, chatId: String): Mono<ChatRole> {
        return mono {
            val chatRole = chatRoleCacheService.find(roleId).awaitFirstOrNull()

            if (chatRole == null || chatRole.chatId != chatId) {
                throw ChatRoleNotFoundException("Could not find chat role $roleId in chat $chatId")
            }

            return@mono chatRole
        }
    }

    override fun createRolesForChat(chat: Chat): Flux<ChatRole> {
        return mono {
            val chatRoleTemplates = chatRoleTemplateRepository.findAll().collectList().awaitFirst()
            val roles = mutableListOf<ChatRole>()

            for (chatRoleTemplate in chatRoleTemplates) {
                roles.add(ChatRole(
                        id = ObjectId().toHexString(),
                        chatId = chat.id,
                        name = chatRoleTemplate.name,
                        features = chatRoleTemplate.features,
                        default = chatRoleTemplate.name == StandardChatRole.USER.name,
                        level = chatRoleTemplate.level,
                        templateId = chatRoleTemplate.id,
                        createdAt = ZonedDateTime.now()
                ))
            }

            chatRoleTemplateRepository.saveAll(chatRoleTemplates).collectList().awaitFirst()

            return@mono roles
        }
                .flatMapMany { Flux.fromIterable(it) }
    }

    override fun createUserRoleForChat(chat: Chat): Mono<ChatRole> {
        return mono {
            val userRoleTemplate = chatRoleTemplateRepository.findByName(StandardChatRole.USER.name).awaitFirst()
            val userRole = ChatRole(
                    id = ObjectId().toHexString(),
                    chatId = chat.id,
                    name = userRoleTemplate.name,
                    features = userRoleTemplate.features,
                    default = true,
                    level = userRoleTemplate.level,
                    templateId = userRoleTemplate.id,
                    createdAt = ZonedDateTime.now()
            )
            chatRoleRepository.save(userRole).awaitFirst()

            return@mono userRole
        }
    }

    override fun findRolesByChat(chatId: String): Flux<ChatRoleResponse> {
        return mono {
            chatCacheWrapper.findById(chatId).awaitFirstOrNull()
                    ?: throw ChatNotFoundException("Could not find chat with id $chatId")

            val chatRoles = chatRoleRepository.findByChatId(chatId).collectList().awaitFirst()
            val relatedUsers = hashMapOf<String, NTuple2<User?, User?>>()

            for (chatRole in chatRoles) {
                val createdBy = if (chatRole.createdBy != null) {
                    userCacheService.findById(chatRole.createdBy).awaitFirst()
                } else {
                    null
                }
                val updatedBy = if (chatRole.updatedBy != null) {
                    userCacheService.findById(chatRole.updatedBy).awaitFirst()
                } else {
                    null
                }
                relatedUsers[chatRole.id] = NTuple2(createdBy, updatedBy)
            }

            return@mono chatRoles.map { chatRole -> chatRoleMapper.toChatRoleResponse(
                    chatRole = chatRole,
                    createdBy = relatedUsers[chatRole.id]?.t1,
                    updatedBy = relatedUsers[chatRole.id]?.t2
            ) }
        }
                .flatMapMany { Flux.fromIterable(it) }
    }

    override fun createChatRole(chatId: String, createChatRoleRequest: CreateChatRoleRequest): Mono<ChatRoleResponse> {
        return mono {
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val chatRole = ChatRole(
                    id = ObjectId().toHexString(),
                    chatId = chatId,
                    name = createChatRoleRequest.name,
                    features = createChatRoleRequest.features,
                    level = createChatRoleRequest.level,
                    createdAt = ZonedDateTime.now(),
                    createdBy = currentUser.id,
                    default = false
            )
            chatRoleRepository.save(chatRole).awaitFirst()

            return@mono chatRoleMapper.toChatRoleResponse(
                    chatRole = chatRole,
                    createdBy = currentUser
            )
        }
    }

    override fun updateChatRole(chatId: String, roleId: String, updateChatRoleRequest: UpdateChatRoleRequest): Mono<ChatRoleResponse> {
        return mono {
            chatCacheWrapper.findById(chatId).awaitFirstOrNull()
                    ?: throw ChatNotFoundException("Could not find chat with id $chatId")

            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            var chatRole = chatRoleRepository.findById(roleId).awaitFirst()

            if (chatRole.chatId != chatId) {
                throw ChatRoleNotFoundException("Could not find role $roleId in chat $chatId")
            }

            chatRole = chatRole.copy(
                    features = updateChatRoleRequest.features,
                    updatedBy = currentUser.id,
                    updatedAt = ZonedDateTime.now()
            )
            chatRoleRepository.save(chatRole).awaitFirst()

            var createdBy: User? = null

            if (chatRole.createdBy != null) {
                createdBy = userCacheService.findById(chatRole.createdBy).awaitFirstOrNull()
            }

            return@mono chatRoleMapper.toChatRoleResponse(
                    chatRole = chatRole,
                    createdBy = createdBy,
                    updatedBy = currentUser
            )
        }
    }
}