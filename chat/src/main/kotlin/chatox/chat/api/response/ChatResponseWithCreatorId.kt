package chatox.chat.api.response

import chatox.chat.model.ChatType
import chatox.chat.model.ImageUploadMetadata
import chatox.chat.model.SlowMode
import com.fasterxml.jackson.annotation.JsonInclude

data class ChatResponseWithCreatorId(
        val id: String,
        val name: String,
        val description: String?,
        val avatarUri: String?,
        val tags: List<String> = arrayListOf(),
        val slug: String,
        @field:JsonInclude(JsonInclude.Include.NON_NULL)
        val createdByCurrentUser: Boolean?,
        @field:JsonInclude(JsonInclude.Include.NON_NULL)
        val participantsCount: Int? = null,
        val onlineParticipantsCount: Int? = null,
        val avatar: UploadResponse<ImageUploadMetadata>?,
        val createdById: String?,
        val type: ChatType,
        val slowMode: SlowMode? = null
)
