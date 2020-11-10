package chatox.chat.exception.metadata

import com.fasterxml.jackson.annotation.JsonInclude

data class ExceptionMetadata(
        val errorCode: String,
        @field:JsonInclude(JsonInclude.Include.NON_EMPTY)
        val additional: Map<String, String>? = null
)
