package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document(collection = "chatParticipation")
data class ChatParticipation(
        @Id
        var id: String? = null,

        @Indexed
        var chatId: String,

        var user: User,

        var role: ChatRole,

        @Indexed
        var lastReadMessageId: String? = null,

        var lastReadMessageAt: ZonedDateTime? = null,

        @Indexed
        var lastReadMessageCreatedAt: ZonedDateTime? = null,

        @Indexed
        val lastMessageReadId: String? = null,
        val createdAt: ZonedDateTime,
        val lastModifiedAt: ZonedDateTime? = null,

        @Indexed
        var lastActiveChatBlockingId: String? = null,
        var userOnline: Boolean = false,
        var deleted: Boolean = false,
        var deletedAt: ZonedDateTime? = null,

        @Indexed
        var deletedById: String? = null,
        var userDisplayedName: String?,
        var chatDeleted: Boolean = false
)
