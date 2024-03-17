package chatox.chat.model

import java.time.ZonedDateTime

interface MessageInterface {
    val id: String
    val text: String
    val referredMessageId: String?
    val senderId: String
    val chatId: String
    val createdAt: ZonedDateTime
    val updatedAt: ZonedDateTime?
    val deleted: Boolean
    val deletedAt: ZonedDateTime?
    val deletedById: String?
    val uploadAttachmentsIds: List<String>
    val attachments: List<Upload<*>>
    val emoji: EmojiInfo
    val pinned: Boolean
    val pinnedById: String?
    val pinnedAt: ZonedDateTime?
    val fromScheduled: Boolean
    val index: Long
    val sticker: Sticker<Any>?
    val scheduledAt: ZonedDateTime?
    val chatParticipationId: String?
    val forwardedFromMessageId: String?
    val forwardedFromChatId: String?
    val forwardedFromDialogChatType: ChatType?
    val forwardedById: String?
    val chatParticipationIdInSourceChat: String?
    val mentionedUsers: List<String>
}