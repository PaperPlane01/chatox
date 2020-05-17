package chatox.chat.service.impl

import chatox.chat.api.request.UpdateChatParticipationRequest
import chatox.chat.api.response.ChatParticipationMinifiedResponse
import chatox.chat.api.response.ChatParticipationResponse
import chatox.chat.exception.ChatNotFoundException
import chatox.chat.exception.ChatParticipationNotFoundException
import chatox.chat.mapper.ChatParticipationMapper
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
import chatox.chat.support.pagination.PaginationRequest
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
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
class ChatParticipationServiceImpl(private val chatParticipationRepository: ChatParticipationRepository,
                                   private val chatRepository: ChatRepository,
                                   private val userRepository: UserRepository,
                                   private val chatParticipationMapper: ChatParticipationMapper,
                                   private val chatEventsPublisher: ChatEventsPublisher,
                                   private val authenticationFacade: AuthenticationFacade): ChatParticipationService {
    private lateinit var chatParticipationPermissions: ChatParticipationPermissions

    @Autowired
    fun setChatParticipationPermissions(chatParticipationPermissions: ChatParticipationPermissions) {
        this.chatParticipationPermissions = chatParticipationPermissions
    }

    override fun joinChat(chatId: String): Mono<ChatParticipationMinifiedResponse> {
        return assertCanJoinChat(chatId)
                .flatMap {
                    chatRepository.findById(chatId)
                        .switchIfEmpty(Mono.error(ChatNotFoundException("Could nof find chat with id $chatId")))
                        .zipWith(authenticationFacade.getCurrentUser())
                        .map { ChatParticipation(
                                id = UUID.randomUUID().toString(),
                                user = it.t2,
                                chat = it.t1,
                                createdAt = ZonedDateTime.now(),
                                role = ChatRole.USER,
                                lastMessageRead = null
                        ) }
                        .map { chatParticipationRepository.save(it) }
                        .flatMap { it }
                        .map {
                            chatEventsPublisher.userJoinedChat(chatParticipationMapper.toChatParticipationResponse(it))
                            chatParticipationMapper.toMinifiedChatParticipationResponse(it)
                        }
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
        return assertCanLeaveChat(chatId)
                .flatMap {
                    chatRepository.findById(chatId)
                            .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $chatId")))
                            .zipWith(authenticationFacade.getCurrentUser())
                            .flatMap { chatParticipationRepository.findByChatAndUser(
                                    chat = it.t1,
                                    user = it.t2
                            ) }
                            .flatMap { chatParticipationRepository.delete(it).then(Mono.just(it)) }
                            .map { chatEventsPublisher.userLeftChat(it.chat.id, it.id!!) }
                            .then()
                }
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
        return assertCanUpdateChatParticipation(id, chatId)
                .flatMap {
                    chatParticipationRepository.findById(id)
                            .switchIfEmpty(Mono.error(ChatParticipationNotFoundException("Could not find chat participation with id $id")))
                            .flatMap {
                                chatParticipationRepository.delete(it)
                                Mono.just(it)
                            }
                            .map { chatEventsPublisher.chatParticipationDeleted(it.chat.id, it.id!!) }
                            .then()
                }
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
        return chatRepository.findById(chatId)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $chatId")))
                .map { chatParticipationRepository.findByChat(
                        it,
                        paginationRequest.toPageRequest()
                ) }
                .map { it.map { chatParticipation -> chatParticipationMapper.toChatParticipationResponse(chatParticipation) } }
                .flatMapMany { it }

    }

    override fun searchChatParticipants(chatId: String, query: String, paginationRequest: PaginationRequest): Flux<ChatParticipationResponse> {
        return chatRepository.findById(chatId)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $chatId")))
                .map { chatParticipationRepository.findByChatAndUserFirstNameContains(
                        it,
                        username = query,
                        pageable = paginationRequest.toPageRequest()
                ) }
                .map { it.map { chatParticipation -> chatParticipationMapper.toChatParticipationResponse(chatParticipation) } }
                .flatMapMany { it }
    }

    override fun getRoleOfUserInChat(chatId: String, user: User): Mono<ChatRole> {
        return chatRepository.findById(chatId)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $chatId")))
                .map { chatParticipationRepository.findByChatAndUser(chat = it, user = user) }
                .switchIfEmpty(Mono.empty())
                .flatMap { it }
                .map { it.role }
    }

    override fun getRoleOfUserInChat(chatId: String, userId: String): Mono<ChatRole> {
        return chatRepository.findById(chatId)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $chatId")))
                .zipWith(userRepository.findById(userId))
                .map { chatParticipationRepository.findByChatAndUser(it.t1, it.t2) }
                .flatMap {
                    println("Found chat participation $it")
                    it
                }
                .map { it.role }
    }

    override fun getRoleOfUserInChat(chat: Chat, user: User): Mono<ChatRole> {
        return mono {
            val chatParticipation = chatParticipationRepository.findByChatAndUser(chat, user).awaitFirstOrNull()

            chatParticipation?.role ?: ChatRole.NOT_PARTICIPANT
        }
    }

    override fun findChatParticipationById(participationId: String): Mono<ChatParticipationResponse> {
        return chatParticipationRepository.findById(participationId)
                .switchIfEmpty(Mono.error(ChatParticipationNotFoundException("Could not find chat participation with id $participationId")))
                .map { chatParticipationMapper.toChatParticipationResponse(it) }
    }

    override fun getMinifiedChatParticipation(chatId: String, user: User): Mono<ChatParticipationMinifiedResponse> {
        return chatRepository.findById(chatId)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $chatId")))
                .flatMap { chatParticipationRepository.findByChatAndUser(it, user) }
                .map { chatParticipationMapper.toMinifiedChatParticipationResponse(it) }
    }
}
