package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.DBRef
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document(collection = "chat")
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

        @DBRef
        var createdBy: User,

        @Indexed
        var createdById: String? = null,
        var updatedAt: ZonedDateTime? = null,
        var deletedAt: ZonedDateTime? = null,
        var deleted: Boolean,

        @DBRef
        var deletedBy: User? = null,
        var deletedById: String? = null,
        var type: ChatType,
        var numberOfParticipants: Int = 0,
        var numberOfOnlineParticipants: Int = 0,

        @DBRef(lazy = true)
        var lastMessage: Message? = null,

        @Indexed
        var lastMessageId: String? = null,
        var lastMessageDate: ZonedDateTime? = null,

        @DBRef
        var messagesCounter: ChatMessagesCounter? = null,

        @DBRef
        var chatDeletion: ChatDeletion? = null
) {
        override fun toString(): String {
                return "Chat(id='$id', name='$name', description=$description, tags=$tags, avatarUri=$avatarUri, slug='$slug', createdAt=$createdAt, createdBy=$createdBy, updatedAt=$updatedAt, deletedAt=$deletedAt, deleted=$deleted, deletedBy=$deletedBy, type=$type, numberOfParticipants=$numberOfParticipants, lastMessage=${lastMessage?.id}, lastMessageDate=$lastMessageDate)"
        }
}
