package chatox.chat.api.response

import chatox.chat.model.ImageUploadMetadata
import chatox.chat.model.UploadType

data class UploadResponse<MetadataType>(
        val id: String,
        val name: String,
        val extension: String,
        val mimeType: String,
        val meta: MetadataType?,
        val preview: UploadResponse<ImageUploadMetadata>?,
        val thumbnail: UploadResponse<ImageUploadMetadata>?,
        val type: UploadType,
        val originalName: String,
        val uri: String
)
