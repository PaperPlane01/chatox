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
        val emoji: EmojiInfo = EmojiInfo()
)
