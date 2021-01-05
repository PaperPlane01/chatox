package chatox.user.api.response

import chatox.user.domain.ImageUploadMetadata
import chatox.user.domain.UploadType

data class UploadResponse<MetadataType>(
        val id: String,
        val name: String,
        val extension: String,
        val mimeType: String,
        val meta: MetadataType,
        val type: UploadType,
        val uri: String,
        val originalName: String
)
