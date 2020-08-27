package chatox.chat.mapper

import chatox.chat.api.request.CreateMessageRequest
import chatox.chat.api.request.UpdateMessageRequest
import chatox.chat.api.response.MessageResponse
import chatox.chat.model.Chat
import chatox.chat.model.EmojiInfo
import chatox.chat.model.Message
import chatox.chat.model.User
import org.springframework.stereotype.Component
import java.time.ZonedDateTime
import java.util.UUID

@Component
class MessageMapper(private val userMapper: UserMapper) {
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
                emoji = message.emoji
        )
    }

    fun fromCreateMessageRequest(
            createMessageRequest: CreateMessageRequest,
            sender: User,
            chat: Chat,
            referredMessage: Message?,
            emoji: EmojiInfo = EmojiInfo()
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
            emoji = emoji
    )

    fun mapMessageUpdate(updateMessageRequest: UpdateMessageRequest,
                         originalMessage: Message,
                         emojis: EmojiInfo = originalMessage.emoji
    ) = originalMessage.copy(
            text = updateMessageRequest.text ?: originalMessage.text,
            updatedAt = ZonedDateTime.now(),
            emoji = emojis
    )
}
