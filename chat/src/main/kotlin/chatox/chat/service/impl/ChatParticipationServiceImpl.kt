package chatox.chat.service.impl

import chatox.chat.api.request.UpdateChatParticipationRequest
import chatox.chat.api.response.ChatParticipationMinifiedResponse
import chatox.chat.api.response.ChatParticipationResponse
import chatox.chat.exception.ChatNotFoundException
import chatox.chat.exception.ChatParticipationNotFoundException
import chatox.chat.mapper.ChatParticipationMapper
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatRole
import chatox.chat.model.User
import chatox.chat.repository.ChatParticipationRepository
import chatox.chat.repository.ChatRepository
import chatox.chat.security.AuthenticationFacade
import chatox.chat.service.ChatParticipationService
import chatox.chat.support.pagination.PaginationRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.Instant
import java.util.Date
import java.util.UUID

@Service
@Transactional
class ChatParticipationServiceImpl(private val chatParticipationRepository: ChatParticipationRepository,
                                   private val chatRepository: ChatRepository,
                                   private val chatParticipationMapper: ChatParticipationMapper,
                                   private val chatEventsPublisher: ChatEventsPublisher,
                                   private val authenticationFacade: AuthenticationFacade): ChatParticipationService {

    override fun joinChat(chatId: String): Mono<ChatParticipationMinifiedResponse> {
        return chatRepository.findById(chatId)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could nof find chat with id $chatId")))
                .zipWith(authenticationFacade.getCurrentUser())
                .map { ChatParticipation(
                        id = UUID.randomUUID().toString(),
                        user = it.t2,
                        chat = it.t1,
                        createdAt = Date.from(Instant.now()),
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

    override fun leaveChat(chatId: String): Mono<Void> {
        return chatRepository.findById(chatId)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $chatId")))
                .zipWith(authenticationFacade.getCurrentUser())
                .map { chatParticipationRepository.findByChatAndUser(
                        chat = it.t1,
                        user = it.t2
                ) }
                .flatMap { it }
                .map {
                    chatParticipationRepository.delete(it)
                    Mono.just(it)
                }
                .flatMap { it }
                .map { chatEventsPublisher.userLeftChat(it.chat.id, it.id) }
                .then()
    }

    override fun updateChatParticipation(id: String, updateChatParticipationRequest: UpdateChatParticipationRequest): Mono<ChatParticipationResponse> {
        return chatParticipationRepository.findById(id)
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

    override fun deleteChatParticipation(id: String): Mono<Void> {
        return chatParticipationRepository.findById(id)
                .switchIfEmpty(Mono.error(ChatParticipationNotFoundException("Could not find chat participation with id $id")))
                .flatMap {
                    chatParticipationRepository.delete(it)
                    Mono.just(it)
                }
                .map { chatEventsPublisher.chatParticipationDeleted(it.chat.id, it.id) }
                .then()
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

    override fun findChatParticipationById(participationId: String): Mono<ChatParticipationResponse> {
        return chatParticipationRepository.findById(participationId)
                .switchIfEmpty(Mono.error(ChatParticipationNotFoundException("Could not find chat participation with id $participationId")))
                .map { chatParticipationMapper.toChatParticipationResponse(it) }
    }
}
