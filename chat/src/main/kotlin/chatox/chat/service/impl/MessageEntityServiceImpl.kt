package chatox.chat.service.impl

import chatox.chat.api.response.MessageResponse
import chatox.chat.exception.MessageNotFoundException
import chatox.chat.mapper.MessageMapper
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.EmojiInfo
import chatox.chat.model.Message
import chatox.chat.model.User
import chatox.chat.repository.mongodb.MessageMongoRepository
import chatox.chat.service.MessageEntityService
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
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
        private val messageCacheWrapper: ReactiveRepositoryCacheWrapper<Message, String>,
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
                    uploadAttachmentsIds = listOf(),
                    text = "",
                    emoji = EmojiInfo()
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
                    deletedById = currentUser?.id,
                    text = "",
                    emoji = EmojiInfo(),
                    attachments = listOf(),
                    uploadAttachmentsIds = listOf()
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
                    mapReferredMessage = true,
            )
                    .awaitFirst()

            Mono.fromRunnable<Void> { chatEventsPublisher.messageUpdated(response) }.subscribe()

            return@mono response
        }
    }

    override fun findMessageEntityById(id: String): Mono<Message> {
        return findMessageEntityById(id = id, retrieveFromCache = true, throwIfNotFound = true)
    }

    override fun findMessageEntityById(id: String, retrieveFromCache: Boolean, throwIfNotFound: Boolean): Mono<Message> {
        return mono {
            val message = if (retrieveFromCache) {
                messageCacheWrapper.findById(id).awaitFirstOrNull()
            } else {
                messageRepository.findById(id).awaitFirstOrNull()
            }

            return@mono message
        }
                .switchIfEmpty(Mono.defer { onEmptyMessage(id, throwIfNotFound) })
    }

    private fun onEmptyMessage(id: String, throwIfNotFound: Boolean): Mono<Message> {
        return if (throwIfNotFound) {
            Mono.error(MessageNotFoundException("Could not find message with id $id"))
        } else {
            Mono.empty()
        }
    }
}