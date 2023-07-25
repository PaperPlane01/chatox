package chatox.chat.api.response

import com.fasterxml.jackson.annotation.JsonInclude
import java.time.ZonedDateTime

data class ChatUploadAttachmentResponse<UploadMetadataType>(
        val id: String,

        @field:JsonInclude(JsonInclude.Include.NON_NULL)
        val message: MessageResponse?,
        val upload: UploadResponse<UploadMetadataType>,
        val createdAt: ZonedDateTime,
        val uploadCreator: UserResponse?,
        val uploadSender: UserResponse?
)
