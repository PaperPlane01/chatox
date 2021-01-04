package chatox.chat.service.impl

import chatox.chat.api.request.UpdateChatParticipationRequest
import chatox.chat.api.response.ChatParticipationMinifiedResponse
import chatox.chat.api.response.ChatParticipationResponse
import chatox.chat.exception.ChatParticipationNotFoundException
import chatox.chat.exception.metadata.ChatDeletedException
import chatox.chat.exception.metadata.ChatNotFoundException
import chatox.chat.mapper.ChatParticipationMapper
import chatox.chat.messaging.rabbitmq.event.ChatParticipationDeleted
import chatox.chat.messaging.rabbitmq.event.UserLeftChat
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.Chat
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatRole
import chatox.chat.model.User
import chatox.chat.repository.ChatParticipationRepository
import chatox.chat.repository.ChatRepository
import chatox.chat.repository.UserRepository
import chatox.chat.security.AuthenticationFacade
import chatox.chat.security.access.ChatParticipationPermissions
import chatox.chat.service.ChatParticipationService
import chatox.platform.log.LogExecution
import chatox.platform.pagination.PaginationRequest
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime
import java.util.UUID

@Service
@Transactional
@LogExecution
class ChatParticipationServiceImpl(private val chatParticipationRepository: ChatParticipationRepository,
                                   private val chatRepository: ChatRepository,
                                   private val userRepository: UserRepository,
                                   private val chatParticipationMapper: ChatParticipationMapper,
                                   private val chatEventsPublisher: ChatEventsPublisher,
                                   private val authenticationFacade: AuthenticationFacade): ChatParticipationService {
    private lateinit var chatParticipationPermissions: ChatParticipationPermissions
    private val log = LoggerFactory.getLogger(this::class.java)

    @Autowired
    fun setChatParticipationPermissions(chatParticipationPermissions: ChatParticipationPermissions) {
        this.chatParticipationPermissions = chatParticipationPermissions
    }

    override fun joinChat(chatId: String): Mono<ChatParticipationMinifiedResponse> {
        return mono {
            assertCanJoinChat(chatId).awaitFirst()

            val chat = chatRepository.findById(chatId).awaitFirst()

            if (chat.deleted) {
                throw ChatDeletedException(chat.chatDeletion)
            }

            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()

            var chatParticipation = chatParticipationRepository.findByChatIdAndUserAndDeletedTrue(
                    chatId = chat.id,
                    user = currentUser
            )
                    .awaitFirstOrNull()

            if (chatParticipation !== null) {
                chatParticipation = chatParticipation.copy(
                        deleted = false,
                        deletedAt = null,
                        deletedById = null
                )
                chatParticipation = chatParticipationRepository.save(chatParticipation).awaitFirst()
            } else {
                var userDisplayedName = currentUser.firstName

                if (currentUser.lastName != null) {
                    userDisplayedName = "${currentUser.firstName} ${currentUser.lastName}"
                }

                chatParticipation = ChatParticipation(
                        id = UUID.randomUUID().toString(),
                        user = currentUser,
                        chatId = chat.id,
                        createdAt = ZonedDateTime.now(),
                        role = ChatRole.USER,
                        lastReadMessageId = null,
                        userDisplayedName = userDisplayedName
                )
                chatParticipation = chatParticipationRepository.save(chatParticipation).awaitFirst()
            }

            chatRepository.increaseNumberOfParticipants(chat.id).awaitFirst()
            chatEventsPublisher.userJoinedChat(chatParticipationMapper.toChatParticipationResponse(chatParticipation))

            chatParticipationMapper.toMinifiedChatParticipationResponse(chatParticipation).awaitFirst()
        }
    }

    private fun assertCanJoinChat(chatId: String): Mono<Boolean> {
        return chatParticipationPermissions.canJoinChat(chatId)
                .map {
                    if (it) {
                        Mono.just(it)
                    } else {
                        Mono.error<Boolean>(AccessDeniedException("Can't join chat"))
                    }
                }
                .flatMap { it }
    }

    override fun leaveChat(chatId: String): Mono<Void> {
        return mono {
            assertCanLeaveChat(chatId).awaitFirst()
            val chat = chatRepository.findById(chatId).awaitFirst()
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()

            var chatParticipation = chatParticipationRepository
                    .findByChatIdAndUserAndDeletedFalse(
                            chatId = chat.id,
                            user = currentUser
                    )
                    .awaitFirst()
            chatParticipation = chatParticipation.copy(
                    deleted = true,
                    deletedAt = ZonedDateTime.now(),
                    deletedById = currentUser.id
            )
            chatParticipation = chatParticipationRepository.save(chatParticipation).awaitFirst()
            chatRepository.decreaseNumberOfOnlineParticipants(chat.id).awaitFirst()
            chatEventsPublisher.userLeftChat(
                    UserLeftChat(
                            userId = chatParticipation.user.id,
                            chatId = chatParticipation.chatId,
                            chatParticipationId = chatParticipation.id!!
                    )
            )

            Mono.empty<Void>()
        }
                .flatMap { it }
    }

    private fun assertCanLeaveChat(chatId: String): Mono<Boolean> {
        return chatParticipationPermissions.canLeaveChat(chatId)
                .flatMap {
                    if (it) {
                        Mono.just(it)
                    } else {
                        Mono.error<Boolean>(AccessDeniedException("Can't leave chat"))
                    }
                }
    }

    override fun updateChatParticipation(
            id: String,
            chatId: String,
            updateChatParticipationRequest: UpdateChatParticipationRequest
    ): Mono<ChatParticipationResponse> {
        return assertCanUpdateChatParticipation(id, chatId)
                .flatMap {
                    chatParticipationRepository.findById(id)
                            .switchIfEmpty(Mono.error(ChatParticipationNotFoundException("Could not find chat participation with id $id")))
                            .map { chatParticipationMapper.mapChatParticipationUpdate(
                                    updateChatParticipationRequest, it
                            ) }
                            .flatMap { chatParticipationRepository.save(it) }
                            .map { chatParticipationMapper.toChatParticipationResponse(it) }
                            .map {
                                chatEventsPublisher.chatParticipationUpdated(it)
                                it
                            }
                }
    }

    private fun assertCanUpdateChatParticipation(chatId: String, chatParticipationId: String): Mono<Boolean> {
        return chatParticipationPermissions.canUpdateChatParticipant(chatId, chatParticipationId)
                .flatMap {
                    if (it) {
                        Mono.just(it)
                    } else {
                        Mono.error<Boolean>(AccessDeniedException("Can't update chat participation"))
                    }
                }
    }

    override fun deleteChatParticipation(id: String, chatId: String): Mono<Void> {
        return mono {
            log.info("Asserting can delete chat participation")
            assertCanDeleteChatParticipation(id, chatId).awaitFirst()

            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()

            var chatParticipation = chatParticipationRepository.findByIdAndDeletedFalse(id).awaitFirst()

            log.info("Marking chat participation as deleted")
            chatParticipation = chatParticipation.copy(
                    deleted = true,
                    deletedAt = ZonedDateTime.now(),
                    deletedById = currentUser.id
            )

            log.info("Saving chat participation to database")
            chatParticipationRepository.save(chatParticipation).awaitFirst()

            if (chatParticipation.userOnline) {
                chatRepository.decreaseNumberOfOnlineParticipants(chatParticipation.chatId).awaitFirst()
            }

            chatRepository.decreaseNumberOfParticipants(chatParticipation.chatId).awaitFirst()

            log.info("Publishing chatParticipationDeleted event")
            chatEventsPublisher.chatParticipationDeleted(
                    ChatParticipationDeleted(
                            userId = chatParticipation.user.id,
                            chatId = chatParticipation.chatId,
                            chatParticipationId = chatParticipation.id!!
                    )
            )

            Mono.empty<Void>()
        }
                .flatMap { it }
    }

    private fun assertCanDeleteChatParticipation(id: String, chatId: String): Mono<Boolean> {
        return chatParticipationPermissions.canKickChatParticipant(chatId, id)
                .flatMap {
                    if (it) {
                        Mono.just(it)
                    } else {
                        Mono.error<Boolean>(AccessDeniedException("Can't delete chat participation"))
                    }
                }
    }

    override fun findParticipantsOfChat(chatId: String, paginationRequest: PaginationRequest): Flux<ChatParticipationResponse> {
        return mono {
            val chat = findChatById(chatId).awaitFirst()
            val chatParticipations = chatParticipationRepository.findByChatIdAndDeletedFalse(
                    chatId = chat.id,
                    pageable = paginationRequest.toPageRequest()
            )
                    .collectList()
                    .awaitFirst()

            Flux.fromIterable(chatParticipations.map { chatParticipation -> chatParticipationMapper.toChatParticipationResponse(chatParticipation) })
        }
                .flatMapMany { it }
    }

    override fun searchChatParticipants(chatId: String, query: String, paginationRequest: PaginationRequest): Flux<ChatParticipationResponse> {
        return mono {
            val chat = findChatById(chatId).awaitFirst()
            val chatParticipations = chatParticipationRepository.searchChatParticipants(
                    chatId = chat.id,
                    query = query,
                    pageable = paginationRequest.toPageRequest()
            )
                    .collectList()
                    .awaitFirst()

            Flux.fromIterable(chatParticipations.map { chatParticipation ->
                chatParticipationMapper.toChatParticipationResponse(chatParticipation)
            })
        }
                .flatMapMany { it }
    }

    override fun getRoleOfUserInChat(chatId: String, user: User): Mono<ChatRole> {
        return chatRepository.findById(chatId)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $chatId")))
                .map { chatParticipationRepository.findByChatIdAndUserAndDeletedFalse(chatId = it.id, user = user) }
                .switchIfEmpty(Mono.empty())
                .flatMap { it }
                .map { it.role }
    }

    override fun getRoleOfUserInChat(chatId: String, userId: String): Mono<ChatRole> {
        return chatRepository.findById(chatId)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $chatId")))
                .zipWith(userRepository.findById(userId))
                .map { chatParticipationRepository.findByChatIdAndUserAndDeletedFalse(it.t1.id, it.t2) }
                .flatMap { it }
                .map { it.role }
    }

    override fun getRoleOfUserInChat(chat: Chat, user: User): Mono<ChatRole> {
        return mono {
            val chatParticipation = chatParticipationRepository
                    .findByChatIdAndUserAndDeletedFalse(chat.id, user)
                    .awaitFirstOrNull()

            chatParticipation?.role ?: ChatRole.NOT_PARTICIPANT
        }
    }

    override fun findChatParticipationById(participationId: String): Mono<ChatParticipationResponse> {
        return chatParticipationRepository.findByIdAndDeletedFalse(participationId)
                .switchIfEmpty(Mono.error(ChatParticipationNotFoundException("Could not find chat participation with id $participationId")))
                .map { chatParticipationMapper.toChatParticipationResponse(it) }
    }

    override fun getMinifiedChatParticipation(chatId: String, user: User): Mono<ChatParticipationMinifiedResponse> {
        return chatRepository.findById(chatId)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $chatId")))
                .flatMap { chatParticipationRepository.findByChatIdAndUserAndDeletedFalse(it.id, user) }
                .flatMap { chatParticipationMapper.toMinifiedChatParticipationResponse(it) }
    }

    override fun findOnlineParticipants(chatId: String): Flux<ChatParticipationResponse> {
        return mono {
            val chat = findChatById(chatId).awaitFirst()
            val onlineParticipants = chatParticipationRepository.findByChatIdAndUserOnlineTrue(chat.id)
                    .collectList()
                    .awaitFirst()

            onlineParticipants.map { chatParticipationMapper.toChatParticipationResponse(it) }
        }
                .flatMapMany { Flux.fromIterable(it) }
    }

    private fun findChatById(chatId: String): Mono<Chat> {
        return chatRepository
                .findById(chatId)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $chatId")))
    }
}
