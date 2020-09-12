package chatox.chat.mapper

import chatox.chat.api.request.CreateMessageRequest
import chatox.chat.api.request.UpdateMessageRequest
import chatox.chat.api.response.MessageResponse
import chatox.chat.model.Chat
import chatox.chat.model.ChatUploadAttachment
import chatox.chat.model.EmojiInfo
import chatox.chat.model.Message
import chatox.chat.model.User
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Component
import java.time.ZonedDateTime
import java.util.UUID

@Component
class MessageMapper(private val userMapper: UserMapper) {
    @Autowired
    @Lazy
    private lateinit var chatUploadAttachmentMapper: ChatUploadAttachmentMapper

    fun toMessageResponse(message: Message, mapReferredMessage: Boolean, readByCurrentUser: Boolean): MessageResponse {
        var referredMessage: MessageResponse? = null

        if (message.referredMessage != null) {
            referredMessage = toMessageResponse(message.referredMessage!!, false, readByCurrentUser);
        }

        return MessageResponse(
                id = message.id,
                deleted = message.deleted,
                createdAt = message.createdAt,
                sender = userMapper.toUserResponse(message.sender),
                text = message.text,
                readByCurrentUser = readByCurrentUser,
                referredMessage = referredMessage,
                updatedAt = message.updatedAt,
                chatId = message.chat.id,
                emoji = message.emoji,
                uploads = message.uploadAttachments.map { chatUploadAttachment ->
                    chatUploadAttachmentMapper.toChatUploadAttachmentResponse(
                            chatUploadAttachment
                    )
                }
        )
    }

    fun fromCreateMessageRequest(
            createMessageRequest: CreateMessageRequest,
            sender: User,
            chat: Chat,
            referredMessage: Message?,
            emoji: EmojiInfo = EmojiInfo(),
            chatUploadAttachments: List<ChatUploadAttachment<Any>> = listOf()
    ) = Message(
            id = UUID.randomUUID().toString(),
            createdAt = ZonedDateTime.now(),
            deleted = false,
            chat = chat,
            deletedBy = null,
            deletedAt = null,
            updatedAt = null,
            referredMessage = referredMessage,
            text = createMessageRequest.text,
            sender = sender,
            emoji = emoji,
            uploadAttachments = chatUploadAttachments
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
