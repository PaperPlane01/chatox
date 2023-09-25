package chatox.chat.model

import chatox.chat.model.elasticsearch.ChatElasticsearch
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document
data class Chat(
        @Id
        override val id: String,
        override val name: String,
        override val description: String? = null,
        override val tags: List<String> = arrayListOf(),
        override val avatarUri: String? = null,
        override val avatar: Upload<ImageUploadMetadata>? = null,

        @Indexed
        override val slug: String,
        override val createdAt: ZonedDateTime,

        @Indexed
        override val createdById: String? = null,
        override val updatedAt: ZonedDateTime? = null,
        override val deletedAt: ZonedDateTime? = null,
        override val deleted: Boolean,

        @Indexed
        override val deletedById: String? = null,
        override val type: ChatType,
        override val numberOfParticipants: Int = 0,
        override val numberOfOnlineParticipants: Int = 0,

        @Indexed
        override val lastMessageId: String? = null,
        override val lastMessageDate: ZonedDateTime? = null,
        override val chatDeletion: ChatDeletion? = null,
        override val dialogDisplay: List<DialogDisplay> = listOf(),
        override val slowMode: SlowMode? = null
) : ChatInterface {
        fun toElasticsearch() = ChatElasticsearch(id, name, description, tags, avatarUri, avatar, slug, createdAt, createdById, updatedAt, deletedAt, deleted, deletedById, type, numberOfParticipants, numberOfOnlineParticipants, lastMessageId, lastMessageDate, chatDeletion, dialogDisplay, slowMode)
}
