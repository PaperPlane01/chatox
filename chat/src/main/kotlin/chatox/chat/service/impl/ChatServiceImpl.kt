package chatox.chat.service.impl

import chatox.chat.api.request.CreateChatRequest
import chatox.chat.api.request.UpdateChatRequest
import chatox.chat.api.response.AvailabilityResponse
import chatox.chat.api.response.ChatOfCurrentUserResponse
import chatox.chat.api.response.ChatResponse
import chatox.chat.exception.ChatNotFoundException
import chatox.chat.mapper.ChatMapper
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatRole
import chatox.chat.repository.ChatParticipationRepository
import chatox.chat.repository.ChatRepository
import chatox.chat.repository.MessageRepository
import chatox.chat.security.AuthenticationFacade
import chatox.chat.security.access.ChatPermissions
import chatox.chat.service.ChatService
import chatox.chat.support.pagination.PaginationRequest
import kotlinx.coroutines.reactive.awaitFirst
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
class ChatServiceImpl(private val chatRepository: ChatRepository,
                      private val chatParticipationRepository: ChatParticipationRepository,
                      private val messageRepository: MessageRepository,
                      private val chatMapper: ChatMapper,
                      private val authenticationFacade: AuthenticationFacade) : ChatService {

    private lateinit var chatPermissions: ChatPermissions

    @Autowired
    fun setChatPermissions(chatPermissions: ChatPermissions) {
        this.chatPermissions = chatPermissions;
    }

    override fun createChat(createChatRequest: CreateChatRequest): Mono<ChatOfCurrentUserResponse> {
        return authenticationFacade.getCurrentUser()
                .map { user -> chatMapper.fromCreateChatRequest(createChatRequest, user) }
                .map { chatRepository.save(it) }
                .flatMap { it }
                .map {
                    chatParticipationRepository.save(
                            chatParticipation = ChatParticipation(
                                    user = it.createdBy,
                                    chat = it,
                                    role = ChatRole.ADMIN,
                                    lastMessageRead = null,
                                    createdAt = ZonedDateTime.now()
                            )
                    )
                }
                .flatMap { it }
                .map { chatMapper.toChatOfCurrentUserResponse(
                        chat = it.chat,
                        chatParticipation = it,
                        unreadMessagesCount = 0,
                        lastMessage = null,
                        lastReadMessage = null,
                        onlineParticipantsCount = 1
                ) }
    }

    override fun updateChat(id: String, updateChatRequest: UpdateChatRequest): Mono<ChatResponse> {
        return assertCanUpdateChat(id)
                .flatMap {
                    chatRepository.findById(id)
                            .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $id")))
                            .map { chatMapper.mapChatUpdate(updateChatRequest, it) }
                            .flatMap { chatRepository.save(it) }
                            .map { chatMapper.toChatResponse(it) }
                }
    }

    private fun assertCanUpdateChat(chatId: String): Mono<Boolean> {
        return chatPermissions.canUpdateChat(chatId)
                .flatMap {
                    if (it) {
                        Mono.just(it)
                    } else {
                        Mono.error<Boolean>(AccessDeniedException("Can't update chat"))
                    }
                }
    }

    override fun deleteChat(id: String): Mono<Void> {
        return assertCanDeleteChat(id)
                .flatMap {
                    chatRepository.findById(id)
                            .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $id")))
                            .zipWith(authenticationFacade.getCurrentUser())
                            .map { it.t1.copy(deleted = true, deletedAt = ZonedDateTime.now(), deletedBy = it.t2) }
                            .flatMap { chatRepository.save(it) }
                            .then()
                }
    }

    private fun assertCanDeleteChat(chatId: String): Mono<Boolean> {
        return chatPermissions.canDeleteChat(chatId)
                .flatMap {
                    if (it) {
                        Mono.just(it)
                    } else {
                        Mono.error<Boolean>(AccessDeniedException("Can't delete chat"))
                    }
                }
    }

    override fun findChatBySlugOrId(slugOrId: String): Mono<ChatResponse> {
        return chatRepository.findByIdEqualsOrSlugEquals(slugOrId, slugOrId)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id or slug $slugOrId")))
                .zipWith(authenticationFacade.getCurrentUser())
                .map { chatMapper.toChatResponse(it.t1, it.t2.id) }
    }

    override fun searchChats(query: String, paginationRequest: PaginationRequest): Flux<ChatResponse> {
        return chatRepository.findByNameContainsOrDescriptionContainsOrTagsContains(query, query, query, paginationRequest.toPageRequest())
                .map { chatMapper.toChatResponse(it) }
    }

    override fun getChatsOfCurrentUser(): Flux<ChatOfCurrentUserResponse> {
        return mono {
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val chatParticipations = chatParticipationRepository
                    .findAllByUser(currentUser)
                    .collectList()
                    .awaitFirst()
            val unreadMessagesMap: MutableMap<String, Int> = HashMap()
            val onlineParticipantsCountMap: MutableMap<String, Int> = HashMap()

            chatParticipations.forEach { chatParticipation ->
                unreadMessagesMap[chatParticipation.chat.id] = countUnreadMessages(Mono.just(chatParticipation))
                        .awaitFirst()
                onlineParticipantsCountMap[chatParticipation.chat.id] = chatParticipationRepository
                        .countByChatAndUserOnlineTrue(chatParticipation.chat)
                        .awaitFirst()
            }

            chatParticipations.map { chatParticipation ->
                chatMapper.toChatOfCurrentUserResponse(
                        chat = chatParticipation.chat,
                        chatParticipation = chatParticipation,
                        lastReadMessage = if (chatParticipation.lastMessageRead != null) chatParticipation.lastMessageRead!!.message else null,
                        lastMessage = chatParticipation.chat.lastMessage,
                        onlineParticipantsCount = onlineParticipantsCountMap[chatParticipation.chat.id]!!,
                        unreadMessagesCount = unreadMessagesMap[chatParticipation.chat.id]!!
                        )
            }
        }
                .flatMapMany { Flux.fromIterable(it) }
    }

    private fun countUnreadMessages(chatParticipation: Mono<ChatParticipation>): Mono<Int> {
        return chatParticipation.map {
            if (it.lastMessageRead != null) {
                val message = it.lastMessageRead!!.message

                if (message != message.chat.lastMessage) {
                    messageRepository.countByChatAndCreatedAtAfter(message.chat, message.createdAt)
                } else {
                    Mono.just(0)
                }
            } else {
                Mono.just(0)
            }
        }
                .flatMap { it }
    }

    override fun isChatCreatedByUser(chatId: String, userId: String): Mono<Boolean> {
        return chatRepository.findById(chatId)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $chatId")))
                .map { it.createdBy.id == userId }
    }

    override fun checkChatSlugAvailability(slug: String): Mono<AvailabilityResponse> {
        return chatRepository.existsBySlug(slug)
                .map { AvailabilityResponse(available = !it) }
    }
}
