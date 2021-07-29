package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import java.time.ZonedDateTime

data class ScheduledMessage(
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
        var scheduledAt: ZonedDateTime,
        var numberOfFailedAttemptsToPublish: Int = 0,
        var sticker: Sticker<Any>? = null
)
