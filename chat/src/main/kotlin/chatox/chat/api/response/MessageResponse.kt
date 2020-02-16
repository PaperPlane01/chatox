package chatox.chat.api.response

import java.util.Date

data class MessageResponse(
        val id: String,
        val text: String,
        val referredMessage: MessageResponse?,
        val sender: UserResponse,
        val deleted: Boolean,
        val createdAt: Date,
        val updatedAt: Date?,
        val readByCurrentUser: Boolean,
        val chatId: String
)
