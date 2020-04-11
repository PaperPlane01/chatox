package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.DBRef
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document(collection = "chat")
data class Chat(
        @Id
        var id: String,
        var name: String,
        var description: String?,
        var tags: List<String> = arrayListOf(),
        val avatarUri: String?,
        var slug: String,
        var createdAt: ZonedDateTime,
        @DBRef
        var createdBy: User,
        var updatedAt: ZonedDateTime?,
        var deletedAt: ZonedDateTime?,
        var deleted: Boolean,
        @DBRef
        var deletedBy: User?,
        var type: ChatType,
        var numberOfParticipants: Int,
        @DBRef
        var lastMessage: Message?,
        var lastMessageDate: ZonedDateTime?
)
