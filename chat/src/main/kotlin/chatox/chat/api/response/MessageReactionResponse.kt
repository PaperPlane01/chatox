package chatox.chat.api.response

import java.time.ZonedDateTime

data class MessageReactionResponse(
    val id: String,
    val user: UserResponse,
    val createdAt: ZonedDateTime,
    val emojiId: String,
    val messageId: String
)
