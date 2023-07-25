package chatox.chat.messaging.rabbitmq.event

import chatox.chat.api.response.ChatRoleResponse
import chatox.chat.api.response.MessageResponse
import chatox.chat.api.response.StickerResponse
import chatox.chat.api.response.UploadResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.model.EmojiInfo
import java.time.ZonedDateTime

data class MessageCreated(
        val id: String,
        val text: String,
        val referredMessage: MessageResponse?,
        val sender: UserResponse,
        val deleted: Boolean,
        val createdAt: ZonedDateTime,
        val updatedAt: ZonedDateTime?,
        val readByCurrentUser: Boolean,
        val chatId: String,
        val emoji: EmojiInfo = EmojiInfo(),
        val attachments: List<UploadResponse<*>> = listOf(),
        val index: Long = 0L,
        val pinned: Boolean,
        val pinnedAt: ZonedDateTime?,
        val pinnedBy: UserResponse?,
        val scheduledAt: ZonedDateTime? = null,
        val sticker: StickerResponse<Any>? = null,
        val senderChatRole: ChatRoleResponse,
        val fromScheduled: Boolean
) {
    fun toMessageResponse() = MessageResponse(
            id,
            text,
            referredMessage,
            sender,
            deleted,
            createdAt,
            updatedAt,
            readByCurrentUser,
            chatId,
            emoji,
            attachments,
            index,
            pinned,
            pinnedAt,
            pinnedBy,
            scheduledAt,
            sticker,
            senderChatRole
    )
}
