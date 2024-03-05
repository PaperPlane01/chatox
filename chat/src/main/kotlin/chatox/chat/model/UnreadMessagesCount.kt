package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document
data class UnreadMessagesCount(
        @Id
        val id: String,

        @Indexed
        val chatParticipationId: String,

        @Indexed
        val userId: String,

        @Indexed
        val chatId: String,

        val unreadMessagesCount: Long = 0,
        val lastReadMessageId: String? = null,
        val lastReadMessageCreatedAt: ZonedDateTime? = null,
        val lastMessageReadAt: ZonedDateTime? = null,
        val unreadMentionsCount: Long = 0
)
