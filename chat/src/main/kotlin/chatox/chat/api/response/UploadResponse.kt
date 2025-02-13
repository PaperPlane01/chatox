package chatox.chat.api.response

import chatox.chat.model.ImageUploadMetadata
import chatox.chat.model.Upload
import chatox.platform.upload.UploadType

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
) {
    fun toUpload(): Upload<MetadataType> = Upload(
            id = id,
            name = name,
            extension = extension ?: "",
            meta = meta,
            mimeType = mimeType,
            type = type,
            originalName = originalName,
            size = size,
            userId = null,
            imagePreview = preview?.toUpload(),
            isPreview = false,
            isThumbnail = false
    )
}
