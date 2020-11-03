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
        val avatar: Upload<ImageUploadMetadata>? = null,
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
        var numberOfOnlineParticipants: Int = 0,

        @DBRef(lazy = true)
        var lastMessage: Message?,
        var lastMessageDate: ZonedDateTime?,

        @DBRef
        var messagesCounter: ChatMessagesCounter?
) {
        override fun toString(): String {
                return "Chat(id='$id', name='$name', description=$description, tags=$tags, avatarUri=$avatarUri, slug='$slug', createdAt=$createdAt, createdBy=$createdBy, updatedAt=$updatedAt, deletedAt=$deletedAt, deleted=$deleted, deletedBy=$deletedBy, type=$type, numberOfParticipants=$numberOfParticipants, lastMessage=${lastMessage?.id}, lastMessageDate=$lastMessageDate)"
        }
}
