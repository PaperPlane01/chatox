package chatox.chat.service.impl

import chatox.chat.api.request.CreateChatRoleTemplateRequest
import chatox.chat.api.request.UpdateChatRoleTemplateRequest
import chatox.chat.api.response.ChatRoleTemplateResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.exception.ChatRoleTemplateAlreadyExistsException
import chatox.chat.exception.ChatRoleTemplateNotFoundException
import chatox.chat.mapper.ChatRoleTemplateMapper
import chatox.chat.model.ChatBlockingFeatureAdditionalData
import chatox.chat.model.ChatBlockingFeatureData
import chatox.chat.model.ChatFeatures
import chatox.chat.model.ChatRoleTemplate
import chatox.chat.model.DefaultChatFeatureData
import chatox.chat.model.LevelBasedFeatureAdditionalData
import chatox.chat.model.LevelBasedFeatureData
import chatox.chat.model.StandardChatRole
import chatox.chat.model.User
import chatox.chat.repository.mongodb.ChatRoleTemplateRepository
import chatox.chat.service.ChatRoleTemplateService
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
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
class ChatRoleTemplateServiceImpl(private val chatRoleTemplateRepository: ChatRoleTemplateRepository,
                                  private val authenticationHolder: ReactiveAuthenticationHolder<User>,
                                  private val chatRoleTemplateMapper: ChatRoleTemplateMapper
) : ChatRoleTemplateService {
    override fun createChatRoleTemplate(createChatRoleTemplateRequest: CreateChatRoleTemplateRequest): Mono<ChatRoleTemplateResponse> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()

            if (chatRoleTemplateRepository.existsByName(createChatRoleTemplateRequest.name).awaitFirst()) {
                throw ChatRoleTemplateAlreadyExistsException("Chat role template with name ${createChatRoleTemplateRequest.name} already exists")
            }

            val chatRoleTemplate = ChatRoleTemplate(
                    id = ObjectId().toHexString(),
                    features = createChatRoleTemplateRequest.features,
                    createdAt = ZonedDateTime.now(),
                    createdBy = currentUser.id,
                    name = createChatRoleTemplateRequest.name,
                    level = createChatRoleTemplateRequest.level
            )

            chatRoleTemplateRepository.save(chatRoleTemplate).awaitFirst()

            return@mono chatRoleTemplateMapper.toChatRoleTemplateResponse(chatRoleTemplate, mutableMapOf()).awaitFirst()
        }
    }

    override fun updateChatRoleTemplate(id: String, updateChatRoleTemplateRequest: UpdateChatRoleTemplateRequest): Mono<ChatRoleTemplateResponse> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            var chatRoleTemplate = chatRoleTemplateRepository.findById(id).awaitFirstOrNull()
                    ?: throw ChatRoleTemplateNotFoundException("Could not find chat role template with id $id")

            chatRoleTemplate = chatRoleTemplate.copy(
                    name = updateChatRoleTemplateRequest.name,
                    features = updateChatRoleTemplateRequest.features,
                    updatedAt = ZonedDateTime.now(),
                    updatedBy = currentUser.id
            )

            chatRoleTemplateRepository.save(chatRoleTemplate).awaitFirst()

            return@mono chatRoleTemplateMapper.toChatRoleTemplateResponse(chatRoleTemplate, mutableMapOf()).awaitFirst()
        }
    }

    override fun getChatRoleTemplates(): Flux<ChatRoleTemplateResponse> {
        val localUsersCache = mutableMapOf<String, UserResponse>()

        return chatRoleTemplateRepository
                .findAll()
                .flatMap { chatRoleTemplate -> chatRoleTemplateMapper.toChatRoleTemplateResponse(chatRoleTemplate, localUsersCache) }
    }

    @EventListener(ApplicationReadyEvent::class)
    override fun initializeDefaultChatRoleTemplates(): Mono<Unit> {
        return mono {
            for (defaultChatRoleTemplate in defaultRoleTemplates) {
                val name = defaultChatRoleTemplate.key
                val features = defaultChatRoleTemplate.value

                val existingRoleTemplate = chatRoleTemplateRepository.findByName(name.toString()).awaitFirstOrNull()

                if (existingRoleTemplate == null) {
                    val chatRoleTemplate = ChatRoleTemplate(
                            id = ObjectId().toHexString(),
                            name = name.toString(),
                            createdAt = ZonedDateTime.now(),
                            level = name.level,
                            features = features
                    )
                    chatRoleTemplateRepository.save(chatRoleTemplate).awaitFirst()
                } else if (existingRoleTemplate.level != name.level || existingRoleTemplate.features != features) {
                    chatRoleTemplateRepository.save(existingRoleTemplate.copy(
                            level = name.level,
                            features = features,
                            updatedAt = ZonedDateTime.now(),
                            updatedBy = null
                    ))
                            .awaitFirst()
                }
            }
        }
    }

    companion object {
        val defaultRoleTemplates = mapOf(
                Pair(
                        StandardChatRole.USER,
                        ChatFeatures()
                ),
                Pair(
                        StandardChatRole.MODERATOR,
                        ChatFeatures(
                                blockUsers = ChatBlockingFeatureData(
                                        enabled = true,
                                        additional = ChatBlockingFeatureAdditionalData(allowPermanent = false)
                                ),
                                kickUsers = DefaultChatFeatureData(enabled = true),
                                kickImmunity = DefaultChatFeatureData(enabled = true),
                                deleteOtherUsersMessages = LevelBasedFeatureData(
                                        enabled = true,
                                        additional = LevelBasedFeatureAdditionalData(
                                                upToLevel = StandardChatRole.USER.level
                                        )
                                ),
                                showRoleNameInMessages = DefaultChatFeatureData(enabled = true)
                        ),
                ),
                Pair(
                        StandardChatRole.ADMIN,
                        ChatFeatures(
                                blockUsers = ChatBlockingFeatureData(
                                        enabled = true,
                                        additional = ChatBlockingFeatureAdditionalData(allowPermanent = true)
                                ),
                                kickUsers = DefaultChatFeatureData(enabled = true),
                                kickImmunity = DefaultChatFeatureData(enabled = true),
                                deleteOtherUsersMessages = LevelBasedFeatureData(
                                        enabled = true,
                                        additional = LevelBasedFeatureAdditionalData(
                                                upToLevel = StandardChatRole.MODERATOR.level
                                        )
                                ),
                                blockingImmunity = LevelBasedFeatureData(
                                        enabled = true,
                                        additional = LevelBasedFeatureAdditionalData(
                                                upToLevel = StandardChatRole.ADMIN.level
                                        )
                                ),
                                modifyChatRoles = LevelBasedFeatureData(
                                        enabled = true,
                                        additional = LevelBasedFeatureAdditionalData(
                                                upToLevel = StandardChatRole.MODERATOR.level
                                        )
                                ),
                                assignChatRole = LevelBasedFeatureData(
                                        enabled = true,
                                        additional = LevelBasedFeatureAdditionalData(
                                                upToLevel = StandardChatRole.MODERATOR.level
                                        )
                                ),
                                changeChatSettings = DefaultChatFeatureData(enabled = true),
                                showRoleNameInMessages = DefaultChatFeatureData(enabled = true),
                                messageDeletionsImmunity = LevelBasedFeatureData(
                                        enabled = true,
                                        additional = LevelBasedFeatureAdditionalData(
                                                upToLevel = StandardChatRole.ADMIN.level
                                        )
                                ),
                                pinMessages = DefaultChatFeatureData(enabled = true)
                        )
                ),
                Pair(
                        StandardChatRole.SUPER_ADMIN,
                        ChatFeatures(
                                blockUsers = ChatBlockingFeatureData(
                                        enabled = true,
                                        additional = ChatBlockingFeatureAdditionalData(allowPermanent = true)
                                ),
                                kickUsers = DefaultChatFeatureData(enabled = true),
                                kickImmunity = DefaultChatFeatureData(enabled = true),
                                deleteOtherUsersMessages = LevelBasedFeatureData(
                                        enabled = true,
                                        additional = LevelBasedFeatureAdditionalData(
                                                upToLevel = StandardChatRole.ADMIN.level
                                        )
                                ),
                                blockingImmunity = LevelBasedFeatureData(
                                        enabled = true
                                ),
                                modifyChatRoles = LevelBasedFeatureData(
                                        enabled = true,
                                        additional = LevelBasedFeatureAdditionalData(
                                                upToLevel = StandardChatRole.ADMIN.level
                                        )
                                ),
                                assignChatRole = LevelBasedFeatureData(
                                        enabled = true,
                                        additional = LevelBasedFeatureAdditionalData(
                                                upToLevel = StandardChatRole.ADMIN.level
                                        )
                                ),
                                changeChatSettings = DefaultChatFeatureData(enabled = true),
                                showRoleNameInMessages = DefaultChatFeatureData(enabled = true),
                                messageDeletionsImmunity = LevelBasedFeatureData(
                                        enabled = true,
                                        additional = LevelBasedFeatureAdditionalData(
                                                upToLevel = StandardChatRole.ADMIN.level
                                        )
                                ),
                                pinMessages = DefaultChatFeatureData(enabled = true)
                        )
                ),
                Pair(
                        StandardChatRole.OWNER,
                        ChatFeatures(
                                blockUsers = ChatBlockingFeatureData(
                                        enabled = true,
                                        additional = ChatBlockingFeatureAdditionalData(allowPermanent = true)
                                ),
                                kickUsers = DefaultChatFeatureData(enabled = true),
                                kickImmunity = DefaultChatFeatureData(enabled = true),
                                deleteOtherUsersMessages = LevelBasedFeatureData(
                                        enabled = true,
                                        additional = LevelBasedFeatureAdditionalData(
                                                upToLevel = StandardChatRole.SUPER_ADMIN.level
                                        )
                                ),
                                blockingImmunity = LevelBasedFeatureData(
                                        enabled = true
                                ),
                                messageDeletionsImmunity = LevelBasedFeatureData(
                                        enabled = true
                                ),
                                modifyChatRoles = LevelBasedFeatureData(
                                        enabled = true,
                                        additional = LevelBasedFeatureAdditionalData(
                                                upToLevel = StandardChatRole.SUPER_ADMIN.level
                                        )
                                ),
                                assignChatRole = LevelBasedFeatureData(
                                        enabled = true,
                                        additional = LevelBasedFeatureAdditionalData(
                                                upToLevel = StandardChatRole.SUPER_ADMIN.level
                                        )
                                ),
                                changeChatSettings = DefaultChatFeatureData(enabled = true),
                                showRoleNameInMessages = DefaultChatFeatureData(true),
                                deleteChat = DefaultChatFeatureData(enabled = true),
                                pinMessages = DefaultChatFeatureData(enabled = true)
                        )
                )
        )
    }
}