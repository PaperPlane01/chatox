package chatox.user.messaging.rabbitmq.event

import chatox.user.domain.ImageUploadMetadata
import chatox.user.domain.UploadType

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
        val previewImage: UploadCreated<ImageUploadMetadata>?
)
