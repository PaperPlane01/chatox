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
import chatox.chat.service.ChatService
import chatox.chat.support.pagination.PaginationRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.Instant
import java.util.Date

@Service
@Transactional
class ChatServiceImpl(private val chatRepository: ChatRepository,
                      private val chatParticipationRepository: ChatParticipationRepository,
                      private val messageRepository: MessageRepository,
                      private val chatMapper: ChatMapper,
                      private val authenticationFacade: AuthenticationFacade) : ChatService {

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
                                    lastMessageRead = null
                            )
                    )
                }
                .flatMap { it }
                .map { chatMapper.toChatOfCurrentUserResponse(
                        chat = it.chat,
                        chatParticipation = it,
                        unreadMessagesCount = 0,
                        lastMessage = null,
                        lastReadMessage = null
                ) }
    }

    override fun updateChat(id: String, updateChatRequest: UpdateChatRequest): Mono<ChatResponse> {
        return chatRepository.findById(id)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $id")))
                .map { chatMapper.mapChatUpdate(updateChatRequest, it) }
                .map { chatRepository.save(it) }
                .flatMap { it }
                .map { chatMapper.toChatResponse(it) }
    }

    override fun deleteChat(id: String): Mono<Void> {
        return chatRepository.findById(id)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $id")))
                .zipWith(authenticationFacade.getCurrentUser())
                .map { it.t1.copy(deleted = true, deletedAt = Date.from(Instant.now()), deletedBy = it.t2) }
                .map { chatRepository.save(it) }
                .flatMap { Mono.empty<Void>() }
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
        return authenticationFacade.getCurrentUser()
                .map { chatParticipationRepository.findAllByUser(it) }
                .flatMapMany { it }
                .map { Mono.just(it) }
                .parallel()
                .map { it.zipWith(countUnreadMessages(it)) }
                .flatMap { it }
                .sequential()
                .map { chatMapper.toChatOfCurrentUserResponse(
                        chat = it.t1.chat,
                        lastMessage = it.t1.chat.lastMessage,
                        lastReadMessage = if (it.t1.lastMessageRead != null) it.t1.lastMessageRead!!.message else null,
                        unreadMessagesCount = it.t2,
                        chatParticipation = it.t1
                ) }
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
