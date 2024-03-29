package chatox.chat.api.response

import chatox.chat.model.ChatType
import chatox.chat.model.ImageUploadMetadata
import chatox.chat.model.JoinChatAllowance
import chatox.chat.model.SlowMode
import chatox.platform.security.VerificationLevel
import com.fasterxml.jackson.annotation.JsonInclude

data class ChatResponse(
        val id: String,
        val name: String?,
        val description: String?,
        val avatarUri: String?,
        val tags: List<String> = arrayListOf(),
        val slug: String,
        @field:JsonInclude(JsonInclude.Include.NON_NULL)
        val createdByCurrentUser: Boolean?,
        @field:JsonInclude(JsonInclude.Include.NON_NULL)
        val participantsCount: Int?,
        @field:JsonInclude(JsonInclude.Include.NON_NULL)
        val onlineParticipantsCount: Int?,
        val avatar: UploadResponse<ImageUploadMetadata>?,
        val type: ChatType,

        @field:JsonInclude(JsonInclude.Include.NON_NULL)
        val user: UserResponse? = null,

        val slowMode: SlowMode? = null,

        val joinAllowanceSettings: Map<VerificationLevel, JoinChatAllowance> = mapOf(),

        val hideFromSearch: Boolean
)
