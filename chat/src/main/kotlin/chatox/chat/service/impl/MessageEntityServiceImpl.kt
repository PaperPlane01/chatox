package chatox.chat.service.impl

import chatox.chat.api.response.MessageResponse
import chatox.chat.mapper.MessageMapper
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.Message
import chatox.chat.model.User
import chatox.chat.repository.mongodb.MessageMongoRepository
import chatox.chat.service.MessageEntityService
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Service
class MessageEntityServiceImpl(
        private val messageRepository: MessageMongoRepository,
        private val chatEventsPublisher: ChatEventsPublisher,
        private val messageMapper: MessageMapper,
        private val authenticationHolder: ReactiveAuthenticationHolder<User>
) : MessageEntityService {

    override fun deleteMessage(message: Message): Mono<Unit> {
        return mono {
            val currentUser = authenticationHolder.currentUserDetails.awaitFirstOrNull()

            messageRepository.save(message.copy(
                    deleted = true,
                    deletedAt = ZonedDateTime.now(),
                    deletedById = currentUser?.id,
                    attachments = listOf(),
                    uploadAttachmentsIds = listOf()
            ))
                    .awaitFirst()

            Mono.fromRunnable<Void> {
                chatEventsPublisher.messageDeleted(chatId = message.chatId, messageId = message.id)
            }
                    .subscribe()

            return@mono
        }
    }

    override fun deleteMultipleMessages(messages: List<Message>): Mono<Unit> {
        return mono {
            val currentUser = authenticationHolder.currentUserDetails.awaitFirstOrNull()

            messageRepository.saveAll(messages.map { message -> message.copy(
                    deleted = true,
                    deletedAt = ZonedDateTime.now(),
                    deletedById = currentUser?.id
            ) }).collectList().awaitFirst()

            messages.forEach { message ->
                Mono.fromRunnable<Void> {
                    chatEventsPublisher.messageDeleted(chatId = message.chatId, messageId = message.id)
                }
                        .subscribe()
            }
        }
    }

    override fun updateMessage(message: Message): Mono<MessageResponse> {
        return mono {
            messageRepository.save(message.copy(
                    updatedAt = ZonedDateTime.now()
            )).awaitFirst()

            val response = messageMapper.toMessageResponse(
                    message = message,
                    readByCurrentUser = true,
                    mapReferredMessage = true
            )
                    .awaitFirst()

            Mono.fromRunnable<Void> { chatEventsPublisher.messageUpdated(response) }.subscribe()

            return@mono response
        }
    }
}