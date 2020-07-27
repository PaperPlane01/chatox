package chatox.chat.api.response

import java.time.ZonedDateTime

data class ChatBlockingResponse(
     val id: String,
     val blockedUser: UserResponse,
     val blockedBy: UserResponse,
     val blockedUntil: ZonedDateTime,
     val description: String?,
     val canceled: Boolean,
     val canceledAt: ZonedDateTime?,
     val canceledBy: UserResponse?,
     val lastModifiedAt: ZonedDateTime?,
     val lastModifiedBy: UserResponse?,
     val chatId: String,
     val createdAt: ZonedDateTime
)
