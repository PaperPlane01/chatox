package chatox.chat.api.response

import chatox.chat.model.ChatDeletionReason
import chatox.chat.model.ChatType
import chatox.chat.model.ImageUploadMetadata
import chatox.chat.model.SlowMode
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
        val participantsCount: Int = 0,
        val onlineParticipantsCount: Int = 0,
        val avatar: UploadResponse<ImageUploadMetadata>?,
        val createdByCurrentUser: Boolean,
        val deleted: Boolean,
        val type: ChatType,
        val deletionReason: ChatDeletionReason?,
        val deletionComment: String?,
        val user: UserResponse?,
        val slowMode: SlowMode? = null
)
