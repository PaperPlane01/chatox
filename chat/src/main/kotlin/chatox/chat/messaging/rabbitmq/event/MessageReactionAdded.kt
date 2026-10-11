package chatox.chat.messaging.rabbitmq.event

import chatox.chat.api.response.UserResponse
import chatox.platform.text.api.response.EmojiData
import java.time.ZonedDateTime

data class MessageReactionAdded(
    val id: String,
    val emoji: EmojiData,
    val emojiId: String,
    val messageId: String,
    val chatId: String,
    val user: UserResponse,
    val createdAt: ZonedDateTime
)
