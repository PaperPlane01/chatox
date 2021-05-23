package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document(collection = "chatBlocking")
data class ChatBlocking(
        @Id
        val id: String,
        @Indexed
        val chatId: String,

        @Indexed
        val blockedUserId: String,

        @Indexed
        val blockedById: String,
        val blockedUntil: ZonedDateTime,
        val description: String?,
        val createdAt: ZonedDateTime,
        val canceled: Boolean,
        val canceledAt: ZonedDateTime?,

        @Indexed
        val canceledById: String? = null,
        val lastModifiedAt: ZonedDateTime?,

        @Indexed
        val lastModifiedById: String? = null
)
