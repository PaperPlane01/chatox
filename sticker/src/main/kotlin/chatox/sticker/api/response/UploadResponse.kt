package chatox.sticker.api.response

import chatox.sticker.model.ImageUploadMetadata
import chatox.sticker.model.UploadType

data class UploadResponse<MetadataType>(
        val id: String,
        val name: String,
        val extension: String?,
        val mimeType: String,
        val meta: MetadataType?,
        val preview: UploadResponse<ImageUploadMetadata>?,
        val type: UploadType,
        val originalName: String,
        val uri: String,
        val size: Int
)
