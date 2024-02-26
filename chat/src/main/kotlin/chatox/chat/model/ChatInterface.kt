package chatox.chat.model

import chatox.platform.security.VerificationLevel
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
    val lastMessageId: String?
    val lastMessageDate: ZonedDateTime?
    val lastMessageReadByAnyoneId: String?
    val lastMessageReadByAnyoneCreatedAt: ZonedDateTime?
    val chatDeletion: ChatDeletion?
    val dialogDisplay: List<DialogDisplay>
    val slowMode: SlowMode?
    val joinAllowanceSettings: Map<VerificationLevel, JoinChatAllowance>
    val hideFromSearch: Boolean
}