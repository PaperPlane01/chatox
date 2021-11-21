package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document
data class Chat(
        @Id
        var id: String,
        var name: String,
        var description: String? = null,
        var tags: List<String> = arrayListOf(),
        val avatarUri: String? = null,
        val avatar: Upload<ImageUploadMetadata>? = null,

        @Indexed
        var slug: String,
        var createdAt: ZonedDateTime,

        @Indexed
        var createdById: String? = null,
        var updatedAt: ZonedDateTime? = null,
        var deletedAt: ZonedDateTime? = null,
        var deleted: Boolean,

        @Indexed
        var deletedById: String? = null,
        var type: ChatType,
        var numberOfParticipants: Int = 0,
        var numberOfOnlineParticipants: Int = 0,

        @Indexed
        var lastMessageId: String? = null,
        var lastMessageDate: ZonedDateTime? = null,
        var chatDeletion: ChatDeletion? = null
)
