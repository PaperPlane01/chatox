package chatox.chat.service.impl

import chatox.chat.api.request.CreateChatRequest
import chatox.chat.api.request.UpdateChatRequest
import chatox.chat.api.response.ChatOfCurrentUserResponse
import chatox.chat.api.response.ChatResponse
import chatox.chat.exception.ChatNotFoundException
import chatox.chat.mapper.ChatMapper
import chatox.chat.repository.ChatParticipationRepository
import chatox.chat.repository.ChatRepository
import chatox.chat.security.AuthenticationFacade
import chatox.chat.service.ChatService
import chatox.chat.support.pagination.PagedResponse
import chatox.chat.support.pagination.PaginationRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.util.function.Tuples
import java.time.Instant
import java.util.Date

@Service
@Transactional
class ChatServiceImpl(private val chatRepository: ChatRepository,
                      private val chatParticipationRepository: ChatParticipationRepository,
                      private val chatMapper: ChatMapper,
                      private val authenticationFacade: AuthenticationFacade) : ChatService {

    override fun createChat(createChatRequest: CreateChatRequest): Mono<ChatResponse> {
        return authenticationFacade.getCurrentUser()
                .map { user -> chatMapper.fromCreateChatRequest(createChatRequest, user) }
                .map { chatRepository.save(it) }
                .flatMap { it }
                .map { chatMapper.toChatResponse(it, 0, it.createdBy.id) }
    }

    override fun updateChat(id: String, updateChatRequest: UpdateChatRequest): Mono<ChatResponse> {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
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
                .map { Tuples.of(it, chatParticipationRepository.countAllByChat(it)) }
                .map { it.t2.zipWith(Mono.just(it.t1)) }
                .flatMap { it }
                .zipWith(authenticationFacade.getCurrentUser())
                .map { chatMapper.toChatResponse(it.t1.t2, it.t1.t1, it.t2.id) }

    }

    override fun searchChats(query: String, paginationRequest: PaginationRequest): Flux<PagedResponse<ChatResponse>> {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun getChatsOfCurrentUser(): Flux<ChatOfCurrentUserResponse> {
        return authenticationFacade.getCurrentUser()
                .map { chatParticipationRepository.findAllByUser(it) }
                .flatMapMany { it }
                .map { chatMapper.toChatOfCurrentUserResponse(it.chat, it, 0) }
    }

}
