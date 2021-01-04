package chatox.chat.mapper

import chatox.chat.api.request.CreateMessageRequest
import chatox.chat.api.request.UpdateMessageRequest
import chatox.chat.api.response.MessageResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.model.Chat
import chatox.chat.model.EmojiInfo
import chatox.chat.model.Message
import chatox.chat.model.Upload
import chatox.chat.model.User
import chatox.chat.service.MessageService
import chatox.chat.service.UserService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono
import java.time.ZonedDateTime
import java.util.UUID

@Component
class MessageMapper(private val userService: UserService,
                    private val uploadMapper: UploadMapper) {

    private lateinit var messageService: MessageService

    @Autowired
    fun setMessageService(messageService: MessageService) {
        this.messageService = messageService
    }

    fun toMessageResponse(
            message: Message,
            mapReferredMessage: Boolean,
            readByCurrentUser: Boolean,
            localReferredMessagesCache: MutableMap<String, MessageResponse>? = null,
            localUsersCache: MutableMap<String, UserResponse>? = null
    ): Mono<MessageResponse> {
        return mono {
            var referredMessage: MessageResponse? = null

            if (message.referredMessageId != null && mapReferredMessage) {
                if (localReferredMessagesCache != null && localReferredMessagesCache[message.referredMessageId!!] != null) {
                    referredMessage = localReferredMessagesCache[message.referredMessageId!!]!!
                } else {
                    val referredMessageEntity = messageService.findMessageEntityById(message.referredMessageId!!, true)
                            .awaitFirst()
                    referredMessage = toMessageResponse(
                            message = referredMessageEntity,
                            localUsersCache = localUsersCache,
                            localReferredMessagesCache = null,
                            readByCurrentUser = readByCurrentUser,
                            mapReferredMessage = false
                    )
                            .awaitFirst()

                    if (localReferredMessagesCache != null) {
                        localReferredMessagesCache[message.referredMessageId!!] = referredMessage
                    }
                }
            }

            val sender: UserResponse = if (localUsersCache != null && localUsersCache[message.senderId] != null) {
                localUsersCache[message.senderId]!!
            } else {
                userService.findUserByIdAndPutInLocalCache(message.senderId, localUsersCache)
                        .awaitFirst()
            }

            MessageResponse(
                    id = message.id,
                    deleted = message.deleted,
                    createdAt = message.createdAt,
                    sender = sender,
                    text = message.text,
                    readByCurrentUser = readByCurrentUser,
                    referredMessage = referredMessage,
                    updatedAt = message.updatedAt,
                    chatId = message.chatId,
                    emoji = message.emoji,
                    attachments = message.attachments.map { attachment ->
                        uploadMapper.toUploadResponse(
                                attachment
                        )
                    },
                    index = message.index
            )
        }
    }

    fun fromCreateMessageRequest(
            createMessageRequest: CreateMessageRequest,
            sender: User,
            chat: Chat,
            referredMessage: Message?,
            emoji: EmojiInfo = EmojiInfo(),
            attachments: List<Upload<Any>>,
            chatAttachmentsIds: List<String>,
            index: Long
    ) = Message(
            id = UUID.randomUUID().toString(),
            createdAt = ZonedDateTime.now(),
            deleted = false,
            chatId = chat.id,
            deletedById = null,
            deletedAt = null,
            updatedAt = null,
            referredMessageId = referredMessage?.id,
            text = createMessageRequest.text,
            senderId = sender.id,
            emoji = emoji,
            attachments = attachments,
            uploadAttachmentsIds = chatAttachmentsIds,
            index = index
    )

    fun mapMessageUpdate(updateMessageRequest: UpdateMessageRequest,
                         originalMessage: Message,
                         emojis: EmojiInfo = originalMessage.emoji
    ) = originalMessage.copy(
            text = updateMessageRequest.text,
            updatedAt = ZonedDateTime.now(),
            emoji = emojis
    )
}
