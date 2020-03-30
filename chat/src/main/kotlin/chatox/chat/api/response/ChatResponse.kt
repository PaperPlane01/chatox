package chatox.chat.api.response

import com.fasterxml.jackson.annotation.JsonInclude

data class ChatResponse(
        val id: String,
        val name: String,
        val description: String?,
        val avatarUri: String?,
        val tags: List<String> = arrayListOf(),
        val slug: String,
        @field:JsonInclude(JsonInclude.Include.NON_NULL)
        val createdByCurrentUser: Boolean?,
        @field:JsonInclude(JsonInclude.Include.NON_NULL)
        val participantsCount: Int?
)
