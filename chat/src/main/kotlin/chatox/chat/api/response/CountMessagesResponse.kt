package chatox.chat.api.response

import com.fasterxml.jackson.annotation.JsonInclude

data class CountMessagesResponse(
        val totalCount: Int,
        @field:JsonInclude(JsonInclude.Include.NON_NULL)
        val afterMessage: Int?
)
