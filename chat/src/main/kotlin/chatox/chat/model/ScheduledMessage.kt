package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document
data class ScheduledMessage(
        @Id
        override val id: String,
        override val text: String,

        @Indexed
        override val referredMessageId: String? = null,

        @Indexed
        override val senderId: String,

        @Indexed
        override val chatId: String,
        override val createdAt: ZonedDateTime,
        override val updatedAt: ZonedDateTime? = null,
        override val deleted: Boolean = false,
        override val deletedAt: ZonedDateTime? = null,

        @Indexed
        override val deletedById: String? = null,

        override val uploadAttachmentsIds: List<String> = listOf(),
        override val attachments: List<Upload<*>> = listOf(),
        override val emoji: EmojiInfo = EmojiInfo(),
        override val scheduledAt: ZonedDateTime,
        override val sticker: Sticker<Any>? = null,
        override val pinned: Boolean = false,
        override val pinnedById: String? = null,
        override val pinnedAt: ZonedDateTime? = null,
        override val fromScheduled: Boolean = true,
        override val index: Long = -1,
        override val chatParticipationId: String,
        override val chatParticipationIdInSourceChat: String? = null,
        override val forwardedFromMessageId: String? = null,
        override val forwardedFromChatId: String? = null,
        override val forwardedFromDialogChatType: ChatType? = null,
        override val forwardedById: String? = null,
        val numberOfFailedAttemptsToPublish: Int = 0
) : MessageInterface
