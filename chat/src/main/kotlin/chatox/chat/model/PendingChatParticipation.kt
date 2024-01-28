package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document
data class PendingChatParticipation(
        @Id
        val id: String,

        @Indexed
        val chatId: String,

        @Indexed
        val userId: String,

        @Indexed
        val createdAt: ZonedDateTime,

        val inviteId: String? = null,

        val restoredChatParticipationId: String? = null
)