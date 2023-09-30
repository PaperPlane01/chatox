package chatox.chat.service.impl

import chatox.chat.api.request.UpdateMessageRequest
import chatox.chat.api.response.MessageResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.config.CacheWrappersConfig
import chatox.chat.exception.ScheduledMessageNotFoundException
import chatox.chat.exception.metadata.ChatDeletedException
import chatox.chat.exception.metadata.ChatNotFoundException
import chatox.chat.mapper.MessageMapper
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.Chat
import chatox.chat.model.ScheduledMessage
import chatox.chat.repository.mongodb.ChatMessagesCounterRepository
import chatox.chat.repository.mongodb.ChatUploadAttachmentRepository
import chatox.chat.repository.mongodb.MessageMongoRepository
import chatox.chat.repository.mongodb.ScheduledMessageRepository
import chatox.chat.service.EmojiParserService
import chatox.chat.service.ScheduledMessageService
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class ScheduledMessageServiceImpl(
        private val scheduledMessageRepository: ScheduledMessageRepository,
        private val messageRepository: MessageMongoRepository,
        private val chatMessagesCounterRepository: ChatMessagesCounterRepository,
        private val chatUploadAttachmentRepository: ChatUploadAttachmentRepository,

        @Qualifier(CacheWrappersConfig.CHAT_BY_ID_CACHE_WRAPPER)
        private val chatCacheWrapper: ReactiveRepositoryCacheWrapper<Chat, String>,

        private val chatEventsPublisher: ChatEventsPublisher,
        private val emojiParserService: EmojiParserService,
        private val messageMapper: MessageMapper
) : ScheduledMessageService {
    override fun findScheduledMessageById(messageId: String): Mono<MessageResponse> {
        return mono {
            val scheduledMessage = findScheduledMessageEntityById(messageId).awaitFirst()

            return@mono messageMapper.toMessageResponse(
                    message = scheduledMessage,
                    mapReferredMessage = true,
                    readByCurrentUser = false
            )
                    .awaitFirst()
        }
    }

    override fun findScheduledMessagesByChat(chatId: String): Flux<MessageResponse> {
        return mono {
            val scheduledMessages = scheduledMessageRepository.findByChatId(chatId)

            return@mono scheduledMessages.flatMap { message -> messageMapper.toMessageResponse(
                    message = message,
                    mapReferredMessage = true,
                    readByCurrentUser = false,
                    localReferredMessagesCache = hashMapOf(),
                    localUsersCache = hashMapOf(),
                    localChatRolesCache = hashMapOf(),
                    localChatParticipationsCache = hashMapOf()
            ) }
        }
                .flatMapMany { it }
    }

    override fun publishScheduledMessage(chatId: String, messageId: String): Mono<MessageResponse> {
        return mono {
            val scheduledMessage = findScheduledMessageEntityById(messageId).awaitFirst()

            return@mono publishScheduledMessageInternal(
                    scheduledMessage = scheduledMessage,
                    useCurrentDateInsteadOfScheduleDate = true
            )
                    .awaitFirst()
        }
    }

    override fun publishScheduledMessage(scheduledMessage: ScheduledMessage,
                                         localUsersCache: MutableMap<String, UserResponse>?,
                                         localReferredMessagesCache: MutableMap<String, MessageResponse>?): Mono<MessageResponse> {
        return publishScheduledMessageInternal(
                scheduledMessage = scheduledMessage,
                localReferredMessagesCache = localReferredMessagesCache,
                localUsersCache = localUsersCache
        )
    }

    private fun publishScheduledMessageInternal(scheduledMessage: ScheduledMessage,
                                                localUsersCache: MutableMap<String, UserResponse>? = null,
                                                localReferredMessagesCache: MutableMap<String, MessageResponse>? = null,
                                                useCurrentDateInsteadOfScheduleDate: Boolean = false): Mono<MessageResponse> {
        return mono {
            val messageIndex = chatMessagesCounterRepository.getNextCounterValue(scheduledMessage.chatId).awaitFirst()

            val message = messageMapper.fromScheduledMessage(
                    scheduledMessage = scheduledMessage,
                    messageIndex = messageIndex,
                    useCurrentDateInsteadOfScheduledDate = useCurrentDateInsteadOfScheduleDate
            )

            if (message.uploadAttachmentsIds.isNotEmpty()) {
                var chatUploadAttachments = chatUploadAttachmentRepository.findAllById(message.uploadAttachmentsIds)
                        .collectList()
                        .awaitFirst()
                chatUploadAttachments = chatUploadAttachments.map { attachment -> attachment.copy(messageId = message.id) }
                chatUploadAttachmentRepository.saveAll(chatUploadAttachments).collectList().awaitFirst()
            }

            messageRepository.save(message).awaitFirst()
            scheduledMessageRepository.delete(scheduledMessage).awaitFirstOrNull()

            val messageCreated = messageMapper.toMessageCreated(
                    message = message,
                    localUsersCache = localUsersCache,
                    localReferredMessagesCache = localReferredMessagesCache,
                    readByCurrentUser = true,
                    mapReferredMessage = true,
                    fromScheduled = true
            )
                    .awaitFirst()
            val messageResponse = messageCreated.toMessageResponse()

            chatEventsPublisher.messageCreated(messageCreated)
            chatEventsPublisher.scheduledMessagePublished(messageResponse)

            return@mono messageResponse
        }
    }

    override fun deleteScheduledMessage(chatId: String, messageId: String): Mono<Unit> {
        return mono {
            val scheduledMessage = findScheduledMessageEntityById(messageId).awaitFirst()

            scheduledMessageRepository.delete(scheduledMessage).awaitFirstOrNull()
            chatEventsPublisher.scheduledMessageDeleted(messageId = scheduledMessage.id, chatId = scheduledMessage.chatId)

            return@mono
        }
    }

    override fun updateScheduledMessage(chatId: String, messageId: String, updateMessageRequest: UpdateMessageRequest): Mono<MessageResponse> {
        return mono {
            val chat = findChatById(chatId).awaitFirst()

            if (chat.deleted) {
                throw ChatDeletedException(chat.chatDeletion)
            }

            var scheduledMessage = findScheduledMessageEntityById(messageId).awaitFirst()
            var emoji = scheduledMessage.emoji

            if (scheduledMessage.text != updateMessageRequest.text) {
                emoji = emojiParserService.parseEmoji(updateMessageRequest.text).awaitFirst()
            }

            scheduledMessage = messageMapper.mapScheduledMessageUpdate(
                    updateMessageRequest = updateMessageRequest,
                    originalMessage = scheduledMessage,
                    emoji = emoji
            )

            scheduledMessageRepository.save(scheduledMessage).awaitFirst()

            val messageResponse = messageMapper.toMessageResponse(
                    message = scheduledMessage,
                    mapReferredMessage = true,
                    readByCurrentUser = true
            )
                    .awaitFirst()
            chatEventsPublisher.scheduledMessageUpdated(messageResponse)

            return@mono messageResponse
        }
    }

    private fun findChatById(chatId: String) = chatCacheWrapper
            .findById(chatId)
            .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $chatId")))

    private fun findScheduledMessageEntityById(messageId: String): Mono<ScheduledMessage> = scheduledMessageRepository
            .findById(messageId)
            .switchIfEmpty(Mono.error(ScheduledMessageNotFoundException("Could not find scheduled message with id $messageId")))
}