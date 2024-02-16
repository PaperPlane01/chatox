package chatox.chat.api.response

import chatox.chat.model.ChatDeletionReason
import chatox.chat.model.ChatType
import chatox.chat.model.ImageUploadMetadata
import chatox.chat.model.JoinChatAllowance
import chatox.chat.model.SlowMode
import chatox.platform.security.VerificationLevel
import java.time.ZonedDateTime

data class ChatOfCurrentUserResponse(
        val id: String?,
        val slug: String,
        val lastReadMessage: MessageResponse?,
        val name: String,
        val avatarUri: String?,
        val chatParticipation: ChatParticipationMinifiedResponse,
        val unreadMessagesCount: Long,
        val lastMessage: MessageResponse?,
        val createdAt: ZonedDateTime,
        val description: String?,
        val tags: List<String> = arrayListOf(),
        val participantsCount: Int? = null,
        val onlineParticipantsCount: Int? = null,
        val avatar: UploadResponse<ImageUploadMetadata>?,
        val createdByCurrentUser: Boolean,
        val deleted: Boolean,
        val type: ChatType,
        val deletionReason: ChatDeletionReason?,
        val deletionComment: String?,
        val user: UserResponse?,
        val slowMode: SlowMode? = null,
        val joinAllowanceSettings: Map<VerificationLevel, JoinChatAllowance> = mapOf(),
        val hideFromSearch: Boolean
)
