package chatox.chat.service.impl

import chatox.chat.api.request.CreateChatBlockingRequest
import chatox.chat.api.request.UpdateChatBlockingRequest
import chatox.chat.api.response.ChatBlockingResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.exception.ChatBlockingNotFoundException
import chatox.chat.exception.UserNotFoundException
import chatox.chat.exception.metadata.ChatNotFoundException
import chatox.chat.mapper.ChatBlockingMapper
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.Chat
import chatox.chat.model.ChatBlocking
import chatox.chat.model.ChatRole
import chatox.chat.model.User
import chatox.chat.repository.ChatBlockingRepository
import chatox.chat.repository.ChatRepository
import chatox.chat.repository.MessageRepository
import chatox.chat.repository.UserRepository
import chatox.chat.security.AuthenticationFacade
import chatox.chat.security.access.ChatBlockingPermissions
import chatox.chat.service.ChatBlockingService
import chatox.chat.service.ChatParticipationService
import chatox.platform.cache.ReactiveCacheService
import chatox.platform.pagination.PaginationRequest
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Service
@Transactional
class ChatBlockingServiceImpl(private val chatBlockingRepository: ChatBlockingRepository,
                              private val chatRepository: ChatRepository,
                              private val userRepository: UserRepository,
                              private val messageRepository: MessageRepository,
                              private val authenticationFacade: AuthenticationFacade,
                              private val chatBlockingMapper: ChatBlockingMapper,
                              private val chatEventsPublisher: ChatEventsPublisher,
                              private val chatBlockingCacheService: ReactiveCacheService<ChatBlocking, String>
) : ChatBlockingService {
    private lateinit var chatBlockingPermissions: ChatBlockingPermissions
    private lateinit var chatParticipationService: ChatParticipationService

    @Autowired
    fun setChatBlockingPermissions(chatBlockingPermissions: ChatBlockingPermissions) {
        this.chatBlockingPermissions = chatBlockingPermissions
    }

    @Autowired
    fun setChatParticipationService(chatParticipationService: ChatParticipationService) {
        this.chatParticipationService = chatParticipationService
    }

    override fun blockUser(chatId: String, createChatBlockingRequest: CreateChatBlockingRequest): Mono<ChatBlockingResponse> {
        return mono {
            assertCanBlockUser(chatId).awaitFirst()
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val chat = findChatById(chatId).awaitFirst()
            val blockedUser = findUserById(createChatBlockingRequest.userId).awaitFirst()

            var chatBlocking = chatBlockingMapper.fromCreateChatBlockingRequest(
                    createChatBlockingRequest = createChatBlockingRequest,
                    chat = chat,
                    blockedUser = blockedUser,
                    currentUser = currentUser
            )

            chatBlocking = chatBlockingRepository.save(chatBlocking).awaitFirst()

            if (createChatBlockingRequest.deleteRecentMessages) {
                val roleOfUserInChat = chatParticipationService.getRoleOfUserInChat(chat, blockedUser).awaitFirst()

                if (roleOfUserInChat != ChatRole.MODERATOR && roleOfUserInChat != ChatRole.ADMIN) {
                    val deleteMessagesSince = createChatBlockingRequest.deleteMessagesSince ?: ZonedDateTime.now().minusMinutes(5L)
                    var deletedMessages = messageRepository.findBySenderIdAndCreatedAtAfter(
                            senderId = blockedUser.id,
                            date = deleteMessagesSince
                    )
                            .collectList()
                            .awaitFirst()
                    deletedMessages = deletedMessages.map { it.copy(
                            deleted = true,
                            deletedAt = ZonedDateTime.now(),
                            deletedById = currentUser.id
                    ) }
                    deletedMessages = messageRepository.saveAll(deletedMessages).collectList().awaitFirst()
                    chatEventsPublisher.messagesDeleted(
                            chatId = chat.id,
                            messagesIds = deletedMessages.map { it.id }
                    )
                }
            }

            val chatBlockingResponse = chatBlockingMapper.toChatBlockingResponse(chatBlocking).awaitFirst()
            chatEventsPublisher.chatBlockingCreated(chatBlockingResponse)
            chatBlockingResponse
        }
    }

    private fun assertCanBlockUser(chatId: String): Mono<Boolean> {
        return chatBlockingPermissions.canBlockUser(chatId)
                .flatMap {
                    if (!it) {
                        Mono.error<Boolean>(AccessDeniedException("Can't block user in chat"))
                    } else {
                        Mono.just(it)
                    }
                }
    }

    override fun unblockUser(chatId: String, blockingId: String): Mono<ChatBlockingResponse> {
        return mono {
            assertCanUnblockUser(chatId).awaitFirst()
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            var chatBlocking = findBlockingById(blockingId).awaitFirst()

            val cancelDate = ZonedDateTime.now()
            chatBlocking = chatBlocking.copy(
                    canceled = true,
                    canceledAt = cancelDate,
                    canceledById = currentUser.id,
                    lastModifiedAt = cancelDate,
                    lastModifiedById = currentUser.id
            )

            chatBlocking = chatBlockingRepository.save(chatBlocking).awaitFirst()

            val chatBlockingResponse = chatBlockingMapper.toChatBlockingResponse(chatBlocking).awaitFirst()
            chatEventsPublisher.chatBlockingUpdated(chatBlockingResponse)
            chatBlockingResponse
        }
    }

    private fun assertCanUnblockUser(chatId: String): Mono<Boolean> {
        return chatBlockingPermissions.canUnblockUser(chatId)
                .flatMap {
                    if (!it) {
                        Mono.error<Boolean>(AccessDeniedException("Can't unblock user"))
                    } else {
                        Mono.just(it)
                    }
                }

    }

    override fun updateBlocking(
            chatId: String,
            blockingId: String,
            updateBlockingRequest: UpdateChatBlockingRequest
    ): Mono<ChatBlockingResponse> {
        return mono {
            assertCanUpdateBlocking(chatId).awaitFirst()
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()

            var chatBlocking = findBlockingById(blockingId).awaitFirst()
            chatBlocking = chatBlockingMapper.mapChatBlockingUpdate(
                    chatBlocking = chatBlocking,
                    currentUser = currentUser,
                    updateChatBlockingRequest = updateBlockingRequest
            )
            chatBlocking = chatBlockingRepository.save(chatBlocking).awaitFirst()

            val chatBlockingResponse = chatBlockingMapper.toChatBlockingResponse(chatBlocking).awaitFirst()
            chatEventsPublisher.chatBlockingUpdated(chatBlockingResponse)
            chatBlockingResponse
        }
    }

    private fun assertCanUpdateBlocking(chatId: String): Mono<Boolean> {
        return chatBlockingPermissions.canUpdateBlocking(chatId)
                .flatMap {
                    if (!it) {
                        Mono.error<Boolean>(AccessDeniedException("Can't update chat blocking"))
                    } else {
                        Mono.just(it)
                    }
                }
    }

    override fun getBlockingById(chatId: String, blockingId: String): Mono<ChatBlockingResponse> {
        return assertCanSeeBlockings(chatId)
                .flatMap { findBlockingById(blockingId, true) }
                .flatMap { chatBlockingMapper.toChatBlockingResponse(it) }
    }

    override fun getActiveBlockingsByChat(chatId: String, paginationRequest: PaginationRequest): Flux<ChatBlockingResponse> {
        val localUserCache = HashMap<String, UserResponse>()

        return assertCanSeeBlockings(chatId)
                .flatMap { findChatById(chatId) }
                .flatMapMany { chat -> chatBlockingRepository.findByChatIdAndBlockedUntilAfterAndCanceled(
                        chatId = chat.id,
                        canceled = false,
                        date = ZonedDateTime.now(),
                        pageable = paginationRequest.toPageRequest()
                ) }
                .flatMap { chatBlocking -> chatBlockingMapper.toChatBlockingResponse(chatBlocking, localUserCache) }

    }

    override fun getNonActiveBlockingsByChat(chatId: String, paginationRequest: PaginationRequest): Flux<ChatBlockingResponse> {
        val localUserCache = HashMap<String, UserResponse>()

        return assertCanSeeBlockings(chatId)
                .flatMap { findChatById(chatId) }
                .flatMapMany { chat -> chatBlockingRepository.findByChatIdAndBlockedUntilBeforeOrCanceled(
                        chatId = chat.id,
                        canceled = true,
                        date = ZonedDateTime.now(),
                        pageable = paginationRequest.toPageRequest()
                ) }
                .flatMap { chatBlocking -> chatBlockingMapper.toChatBlockingResponse(chatBlocking, localUserCache) }
    }

    override fun getAllBlockingsByChat(chatId: String, paginationRequest: PaginationRequest): Flux<ChatBlockingResponse> {
        val localUserCache = HashMap<String, UserResponse>()

        return assertCanSeeBlockings(chatId)
                .flatMap { findChatById(chatId) }
                .flatMapMany { chat -> chatBlockingRepository.findByChatId(chat.id, paginationRequest.toPageRequest()) }
                .flatMap { chatBlocking -> chatBlockingMapper.toChatBlockingResponse(chatBlocking, localUserCache) }
    }

    override fun isUserBlockedInChat(chatId: String, user: User): Mono<Boolean> {
        return  chatBlockingRepository.findByChatIdAndBlockedUserIdAndBlockedUntilAfterAndCanceled(
                        chatId = chatId,
                        blockedUserId = user.id,
                        canceled = false,
                        date = ZonedDateTime.now()
                )
                .collectList()
                .map { it.isNotEmpty() }
    }

    override fun isUserBlockedInChat(chatId: String, userId: String): Mono<Boolean> {
        return chatBlockingRepository.findByChatIdAndBlockedUserIdAndBlockedUntilAfterAndCanceled(
                chatId = chatId,
                blockedUserId = userId,
                canceled = false,
                date = ZonedDateTime.now()
        )
                .collectList()
                .map { it.isNotEmpty() }
    }

    override fun findChatBlockingById(id: String): Mono<ChatBlockingResponse> {
        return mono {
            val chatBlocking = findBlockingById(id).awaitFirst()

            chatBlockingMapper.toChatBlockingResponse(chatBlocking).awaitFirst()
        }
    }

    private fun assertCanSeeBlockings(chatId: String): Mono<Boolean> {
        return chatBlockingPermissions.canSeeChatBlockings(chatId)
                .flatMap {
                    if (!it) {
                        Mono.error<Boolean>(AccessDeniedException("Can't watch blockings in this chat"))
                    } else {
                        Mono.just(it)
                    }
                }
    }

    private fun findChatById(chatId: String): Mono<Chat> {
        return chatRepository.findById(chatId)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $chatId")))
    }

    private fun findUserById(userId: String): Mono<User> {
        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(UserNotFoundException("Could not find user with id $userId")))
    }

    private fun findBlockingById(blockingId: String, retrieveFromCache: Boolean = false): Mono<ChatBlocking> {
        return mono {
            var chatBlocking: ChatBlocking? = null

            if (retrieveFromCache) {
                chatBlocking = chatBlockingCacheService.find(blockingId).awaitFirstOrNull()
            }

            if (chatBlocking == null) {
                chatBlocking = chatBlockingRepository.findById(blockingId).awaitFirstOrNull()
                if (chatBlocking != null) {
                    chatBlockingCacheService.put(chatBlocking).subscribe()
                }
            }

            if (chatBlocking == null) {
                throw ChatBlockingNotFoundException("Could not find chat blocking with id $blockingId")
            }

            chatBlocking
        }
    }
}
