package chatox.chat.service.impl

import chatox.chat.api.request.CreateMessageRequest
import chatox.chat.api.request.UpdateMessageRequest
import chatox.chat.api.response.MessageResponse
import chatox.chat.exception.ChatNotFoundException
import chatox.chat.exception.MessageNotFoundException
import chatox.chat.mapper.MessageMapper
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.Message
import chatox.chat.model.MessageRead
import chatox.chat.repository.ChatParticipationRepository
import chatox.chat.repository.ChatRepository
import chatox.chat.repository.MessageReadRepository
import chatox.chat.repository.MessageRepository
import chatox.chat.security.AuthenticationFacade
import chatox.chat.service.MessageService
import chatox.chat.support.pagination.PaginationRequest
import chatox.chat.util.isDateBeforeOrEquals
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.util.function.Tuples
import java.time.Instant
import java.util.Date
import java.util.UUID

@Service
@Transactional
class MessageServiceImpl(
        private val messageRepository: MessageRepository,
        private val chatRepository: ChatRepository,
        private val messageReadRepository: MessageReadRepository,
        private val chatParticipationRepository: ChatParticipationRepository,
        private val chatEventsPublisher: ChatEventsPublisher,
        private val authenticationFacade: AuthenticationFacade,
        private val messageMapper: MessageMapper) : MessageService {

    override fun createMessage(chatId: String, createMessageRequest: CreateMessageRequest): Mono<MessageResponse> {
        val chat = findChatById(chatId)
        val savedMessage: Mono<Message>

        if (createMessageRequest.referredMessageId != null) {
            savedMessage = chat.zipWith(findMessageEntityById(createMessageRequest.referredMessageId))
                    .zipWith(authenticationFacade.getCurrentUser())
                    .map { messageMapper.fromCreateMessageRequest(
                            createMessageRequest,
                            sender = it.t2,
                            referredMessage = it.t1.t2,
                            chat = it.t1.t1
                    ) }
                    .map { messageRepository.save(it) }
                    .flatMap { it }
                    .map {
                        chatRepository.save(it.chat.copy(lastMessage = it, lastMessageDate = it.createdAt))
                        it
                    }
        } else {
            savedMessage =  chat.zipWith(authenticationFacade.getCurrentUser())
                    .map { messageMapper.fromCreateMessageRequest(
                            createMessageRequest,
                            sender = it.t2,
                            referredMessage = null,
                            chat = it.t1
                    ) }
                    .map { messageRepository.save(it) }
                    .flatMap { it }
                    .map {
                        chatRepository.save(it.chat.copy(lastMessage = it, lastMessageDate = it.createdAt))
                        it
                    }
        }

        return savedMessage.map { messageMapper.toMessageResponse(
                it,
                mapReferredMessage = true,
                readByCurrentUser = true
        ) }
                .map {
                    chatEventsPublisher.messageCreated(it)
                    it
                }
    }

    override fun updateMessage(id: String, updateMessageRequest: UpdateMessageRequest): Mono<MessageResponse> {
        return findMessageEntityById(id)
                .map { messageMapper.mapMessageUpdate(updateMessageRequest, it) }
                .flatMap { messageRepository.save(it) }
                .map { messageMapper.toMessageResponse(
                        message = it,
                        mapReferredMessage = true,
                        readByCurrentUser = true
                ) }
                .map {
                    chatEventsPublisher.messageUpdated(it)
                    it
                }
    }

    override fun deleteMessage(id: String): Mono<Void> {
        return findMessageEntityById(id)
                .zipWith(authenticationFacade.getCurrentUser())
                .map { it.t1.copy(
                        deleted = true,
                        deletedAt = Date.from(Instant.now()),
                        deletedBy = it.t2
                ) }
                .flatMap { messageRepository.save(it) }
                .map {
                    chatEventsPublisher.messageDeleted(it.chat.id, it.id)
                    it
                }
                .flatMap { Mono.empty<Void>() }
    }

    override fun findMessageById(id: String): Mono<MessageResponse> {
        return findMessageEntityById(id)
                .map { messageMapper.toMessageResponse(
                        message = it,
                        mapReferredMessage = true,
                        readByCurrentUser = true
                ) }
    }

    override fun findMessagesByChat(chatId: String, paginationRequest: PaginationRequest): Flux<MessageResponse> {
        val chat = findChatById(chatId)
        val chatAndCurrentUser = chat.zipWith(authenticationFacade.getCurrentUser())
        val hasAnyReadMessages = chatAndCurrentUser
                .map { messageReadRepository.existsByUserAndChat(
                        user = it.t2,
                        chat = it.t1
                ) }
                .flatMap { it }

        return hasAnyReadMessages.map { doesHaveReadMessages ->
            if (doesHaveReadMessages) {
                val lastMessageRead = chat.zipWith(authenticationFacade.getCurrentUser())
                        .map { messageReadRepository.findTopByUserAndChatOrderByDateDesc(
                                user = it.t2,
                                chat = it.t1
                        ) }

                var lastReadMessage: Message? = null

                lastMessageRead.zipWith(chat)
                        .map { it.t1.zipWith(Mono.just(it.t2)) }
                        .flatMap { it }
                        .map { Tuples.of(
                                it.t1,
                                messageRepository.findByChat(
                                        chat = it.t2,
                                        pageable = paginationRequest.toPageRequest()
                                )
                        ) }
                        .map {
                            lastReadMessage = it.t1.message
                            it.t2
                        }
                        .flatMapMany { it }
                        .map { messageMapper.toMessageResponse(
                                message = it,
                                mapReferredMessage = true,
                                readByCurrentUser = isDateBeforeOrEquals(it.createdAt, lastReadMessage!!.createdAt)
                        ) }
            } else {
                chat.flatMapMany { messageRepository.findByChat(it, paginationRequest.toPageRequest()) }
                        .map { messageMapper.toMessageResponse(
                                message = it,
                                mapReferredMessage = true,
                                readByCurrentUser = false
                        ) }
            }
        }.flatMapMany { it }
    }

    override fun findMessagesSinceMessageByChat(
            chatId: String,
            sinceMessageId: String,
            paginationRequest: PaginationRequest
    ): Flux<MessageResponse> {

        val chat = findChatById(chatId)
        val cursorMessage = findMessageEntityById(sinceMessageId)
        val hasAnyReadMessages = chat.zipWith(authenticationFacade.getCurrentUser())
                .map { messageReadRepository.existsByUserAndChat(
                        user = it.t2,
                        chat = it.t1
                ) }
                .flatMap { it }

        return hasAnyReadMessages.map { doesHaveReadMessages ->
            if (doesHaveReadMessages) {
                val lastMessageRead = chat.zipWith(authenticationFacade.getCurrentUser())
                        .map { messageReadRepository.findTopByUserAndChatOrderByDateDesc(it.t2, it.t1) }
                        .flatMap { it }

                var lastReadMessage: Message? = null

                lastMessageRead.zipWith(chat)
                        .map { Mono.just(it).zipWith(cursorMessage) }
                        .flatMap { it }
                        .map { Tuples.of(it.t1.t1, messageRepository.findByChatAndCreatedAtGreaterThanEqual(
                                chat = it.t1.t2,
                                date = it.t2.createdAt,
                                pageable = paginationRequest.toPageRequest()
                        )) }
                        .map {
                            lastReadMessage = it.t1.message
                            it
                        }
                        .map { it.t2.map { message -> messageMapper.toMessageResponse(
                                message = message,
                                mapReferredMessage = true,
                                readByCurrentUser = isDateBeforeOrEquals(message.createdAt, lastReadMessage!!.createdAt)
                        ) } }
                        .flatMapMany { it }
            } else {
                cursorMessage.zipWith(chat)
                        .map { messageRepository.findByChatAndCreatedAtGreaterThanEqual(
                                it.t2,
                                it.t1.createdAt,
                                paginationRequest.toPageRequest()
                        ) }
                        .flatMapMany { it }
                        .map { messageMapper.toMessageResponse(
                                it,
                                mapReferredMessage = true,
                                readByCurrentUser = false
                        ) }
            }
        }.flatMapMany { it }
    }

    override fun findMessagesBeforeMessageByChat(
            chatId: String,
            beforeMessageId: String,
            paginationRequest: PaginationRequest
    ): Flux<MessageResponse> {
        val chat = findChatById(chatId)
        val cursorMessage = findMessageEntityById(beforeMessageId)
        val hasAnyReadMessages = chat.zipWith(authenticationFacade.getCurrentUser())
                .map { messageReadRepository.existsByUserAndChat(
                        user = it.t2,
                        chat = it.t1
                ) }
                .flatMap { it }

        return hasAnyReadMessages.map { dosesHaveReadMessages ->
            if (dosesHaveReadMessages) {
                val lastMessageRead = chat.zipWith(authenticationFacade.getCurrentUser())
                        .map { messageReadRepository.findTopByUserAndChatOrderByDateDesc(
                                user = it.t2,
                                chat = it.t1)
                        }
                        .flatMap { it }

                var lastReadMessage: Message? = null

                lastMessageRead.zipWith(chat)
                        .map { Mono.just(it).zipWith(cursorMessage) }
                        .flatMap { it }
                        .map { Tuples.of(it.t1.t1, messageRepository.findByChatAndCreatedAtLessThanEqual(
                                chat = it.t1.t2,
                                date = it.t2.createdAt,
                                pageable = paginationRequest.toPageRequest()
                        )) }
                        .map {
                            lastReadMessage = it.t1.message
                            it
                        }
                        .map { it.t2.map { message -> messageMapper.toMessageResponse(
                                message = message,
                                mapReferredMessage = true,
                                readByCurrentUser = isDateBeforeOrEquals(message.createdAt, lastReadMessage!!.createdAt)
                        ) } }
                        .flatMapMany { it }
            } else {
                cursorMessage.zipWith(chat)
                        .map { messageRepository.findByChatAndCreatedAtLessThanEqual(
                                it.t2,
                                it.t1.createdAt,
                                paginationRequest.toPageRequest()
                        ) }
                        .flatMapMany { it }
                        .map { messageMapper.toMessageResponse(
                                it,
                                mapReferredMessage = true,
                                readByCurrentUser = false
                        ) }
            }
         }.flatMapMany { it }

    }

    override fun markMessageRead(messageId: String): Mono<Void> {
        return authenticationFacade.getCurrentUser()
                .zipWith(findMessageEntityById(messageId))
                .map { messageReadRepository.save(MessageRead(
                        id = UUID.randomUUID().toString(),
                        date = Date.from(Instant.now()),
                        message = it.t2,
                        user = it.t1,
                        chat = it.t2.chat
                )) }
                .flatMap { it }
                .map { chatParticipationRepository.findByChatAndUser(it.chat, it.user).zipWith(Mono.just(it)) }
                .flatMap { it }
                .map {
                    if (it.t1.lastMessageRead != null) {
                        if (it.t1.lastMessageRead!!.message.createdAt.before(it.t2.message.createdAt)) {
                            it.t1.lastMessageRead = it.t2
                        }
                    } else {
                        it.t1.lastMessageRead = it.t2
                    }
                    it.t1
                }
                .map { chatParticipationRepository.save(it) }
                .flatMap { Mono.empty<Void>() }
    }

    private fun findChatById(chatId: String) = chatRepository.findById(chatId)
            .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $chatId")))

    private fun findMessageEntityById(id: String) = messageRepository.findById(id)
            .switchIfEmpty(Mono.error(MessageNotFoundException("Could not find message with id $id")))
}