package chatox.chat.api.response

import chatox.chat.model.ChatType
import chatox.chat.model.ImageUploadMetadata
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
        val onlineParticipantsCount: Int = 0,
        val avatar: UploadResponse<ImageUploadMetadata>?,
        val type: ChatType,

        @field:JsonInclude(JsonInclude.Include.NON_NULL)
        val user: UserResponse? = null
)
