package chatox.chat.service.impl

import chatox.chat.api.request.CreateChatRoleRequest
import chatox.chat.api.request.UpdateChatRoleRequest
import chatox.chat.api.response.ChatRoleResponse
import chatox.chat.cache.DefaultChatRoleCacheWrapper
import chatox.chat.exception.ChatRoleNotFoundException
import chatox.chat.exception.metadata.ChatNotFoundException
import chatox.chat.exception.metadata.DefaultRoleIdMustBeSpecifiedException
import chatox.chat.mapper.ChatRoleMapper
import chatox.chat.messaging.rabbitmq.event.publisher.ChatRoleEventsPublisher
import chatox.chat.model.Chat
import chatox.chat.model.ChatRole
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
        private val authenticationFacade: AuthenticationFacade,
        private val defaultChatRoleCache: DefaultChatRoleCacheWrapper,
        private val chatRoleEventsPublisher: ChatRoleEventsPublisher
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
            var formerDefaultRole: ChatRole? = null

            if (createChatRoleRequest.default) {
                formerDefaultRole = defaultChatRoleCache.findByChatId(chatId).awaitFirst()
            }

            val createdAt = ZonedDateTime.now()
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

            if (formerDefaultRole != null) {
                chatRoleRepository.save(formerDefaultRole.copy(
                        default = false,
                        updatedAt = createdAt,
                        updatedBy = currentUser.id
                ))
                        .awaitFirst()
            }

            val chatRoleResponse = chatRoleMapper.toChatRoleResponse(
                    chatRole = chatRole,
                    createdBy = currentUser
            )

            Mono.fromRunnable<Unit> { chatRoleEventsPublisher.chatRoleCreated(chatRoleResponse) }.subscribe()

            return@mono chatRoleResponse
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

            var formerDefaultRole: ChatRole? = null
            var newDefaultRole: ChatRole? = null

            if (chatRole.default != updateChatRoleRequest.default) {
                if (chatRole.default) {
                    formerDefaultRole = defaultChatRoleCache.findByChatId(chatId).awaitFirstOrNull()
                            ?: throw ChatRoleNotFoundException("Could not find role $roleId in chat $chatId")
                } else {
                    if (updateChatRoleRequest.defaultRoleId == null) {
                        throw DefaultRoleIdMustBeSpecifiedException("Default role ID must be specified")
                    }
                    newDefaultRole = chatRoleRepository.findByIdAndChatId(
                            id = updateChatRoleRequest.defaultRoleId,
                            chatId = chatId
                    )
                            .awaitFirstOrNull()
                            ?: throw ChatRoleNotFoundException("Could not find role ${updateChatRoleRequest.defaultRoleId} in chat $chatId")
                }
            }

            val updatedAt = ZonedDateTime.now()
            chatRole = chatRole.copy(
                    name = updateChatRoleRequest.name,
                    level = updateChatRoleRequest.level,
                    features = updateChatRoleRequest.features,
                    updatedBy = currentUser.id,
                    default = updateChatRoleRequest.default,
                    updatedAt = updatedAt
            )
            chatRoleRepository.save(chatRole).awaitFirst()

            if (formerDefaultRole != null) {
                chatRoleRepository.save(formerDefaultRole.copy(
                        default = false,
                        updatedAt = updatedAt,
                        updatedBy = currentUser.id
                )).awaitFirst()
            }

            if (newDefaultRole != null) {
                chatRoleRepository.save(newDefaultRole.copy(
                        default = true,
                        updatedAt = updatedAt,
                        updatedBy = currentUser.id
                )).awaitFirst()
            }

            var createdBy: User? = null

            if (chatRole.createdBy != null) {
                createdBy = userCacheService.findById(chatRole.createdBy).awaitFirstOrNull()
            }

            val chatRoleResponse = chatRoleMapper.toChatRoleResponse(
                    chatRole = chatRole,
                    createdBy = createdBy,
                    updatedBy = currentUser
            )

            Mono.fromRunnable<Unit> { chatRoleEventsPublisher.chatRoleUpdated(chatRoleResponse) }

            return@mono chatRoleResponse
        }
    }
}