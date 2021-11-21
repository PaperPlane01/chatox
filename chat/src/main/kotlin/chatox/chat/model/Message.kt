package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document
data class Message(
        @Id
        var id: String,
        var text: String,

        @Indexed
        var referredMessageId: String? = null,

        @Indexed
        var senderId: String,

        @Indexed
        var chatId: String,
        var createdAt: ZonedDateTime,
        var updatedAt: ZonedDateTime?,
        var deleted: Boolean,
        var deletedAt: ZonedDateTime?,

        @Indexed
        var deletedById: String? = null,

        var uploadAttachmentsIds: List<String> = listOf(),
        var attachments: List<Upload<Any>> = listOf(),
        var emoji: EmojiInfo = EmojiInfo(),

        @Indexed
        var pinned: Boolean = false,
        var pinnedById: String? = null,
        var pinnedAt: ZonedDateTime? = null,
        var fromScheduled: Boolean = false,

        @Indexed
        var index: Long = 0L,

        var sticker: Sticker<Any>? = null
)
