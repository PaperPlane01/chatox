package chatox.chat.api.request

import javax.validation.constraints.Size

data class DeleteMultipleChatUploadAttachmentsRequest(
        @field:Size(max = 50)
        val chatUploadAttachmentsIds: List<String>
)
