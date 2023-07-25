package chatox.chat.api.response

import chatox.chat.model.EmojiInfo
import java.time.ZonedDateTime

data class MessageResponse(
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
        val senderChatRole: ChatRoleResponse
)
