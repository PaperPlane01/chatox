package chatox.chat.model

import java.time.ZonedDateTime

interface ChatInterface {
    val id: String
    val name: String
    val description: String?
    val tags: List<String>
    val avatarUri: String?
    val avatar: Upload<ImageUploadMetadata>?
    val slug: String
    val createdAt: ZonedDateTime
    val createdById: String?
    val updatedAt: ZonedDateTime?
    val deletedAt: ZonedDateTime?
    val deleted: Boolean
    val deletedById: String?
    val type: ChatType
    val numberOfParticipants: Int
    val numberOfOnlineParticipants: Int
    val lastMessageId: String?
    val lastMessageDate: ZonedDateTime?
    val chatDeletion: ChatDeletion?
    val dialogDisplay: List<DialogDisplay>
    val slowMode: SlowMode?
}