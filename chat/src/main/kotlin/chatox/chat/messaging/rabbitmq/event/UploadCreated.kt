package chatox.chat.messaging.rabbitmq.event

import chatox.chat.model.ImageUploadMetadata
import chatox.chat.model.UploadType

data class UploadCreated<MetadataType>(
        val id: String,
        val type: UploadType,
        val meta: MetadataType,
        val extension: String,
        val originalName: String,
        val name: String,
        val mimeType: String,
        val size: Int,
        val isPreview: Boolean,
        val isThumbnail: Boolean,
        val userId: String?,
        val preview: UploadCreated<ImageUploadMetadata>?,
        val thumbnails: List<UploadCreated<ImageUploadMetadata>>,
        val originalId: String?
)
