package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.DBRef
import org.springframework.data.mongodb.core.mapping.Document
import java.util.Date

@Document(collection = "chat")
data class Chat(
        @Id
        var id: String,
        var name: String,
        var description: String?,
        var tags: List<String> = arrayListOf(),
        val avatarUri: String?,
        var slug: String,
        var createdAt: Date,
        @DBRef
        var createdBy: User,
        var updatedAt: Date?,
        var deletedAt: Date?,
        var deleted: Boolean,
        @DBRef
        var deletedBy: User?,
        var type: ChatType
)
