package chatox.sticker.mapper

import chatox.sticker.api.response.UploadResponse
import chatox.sticker.messaging.rabbitmq.event.UploadCreated
import chatox.sticker.model.ImageUploadMetadata
import chatox.sticker.model.Upload
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class UploadMapper {
    @Value("\${uploads.images}")
    private lateinit var imagesBaseUrl: String

    fun <MetadataType> toUploadResponse(upload: Upload<MetadataType>): UploadResponse<MetadataType> = UploadResponse(
            id = upload.id,
            type = upload.type,
            name = upload.name,
            extension = upload.extension,
            mimeType = upload.mimeType,
            meta = upload.meta,
            preview = if (upload.imagePreview != null) toUploadResponse(upload.imagePreview) else null,
            uri = getUploadUri(upload = upload),
            originalName = upload.originalName,
            size = upload.size
    )

    fun <MetadataType>fromUploadCreated(uploadCreated: UploadCreated<MetadataType>,
                                        preview: Upload<ImageUploadMetadata>? = null
    ): Upload<MetadataType> = Upload(
            id = uploadCreated.id,
            imagePreview = preview,
            meta = uploadCreated.meta,
            extension = uploadCreated.extension,
            name = uploadCreated.name,
            isPreview = uploadCreated.isPreview,
            isThumbnail = uploadCreated.isThumbnail,
            mimeType = uploadCreated.mimeType,
            size = uploadCreated.size,
            type = uploadCreated.type,
            userId = uploadCreated.userId,
            originalName = uploadCreated.originalName
    )

    private fun <MetadataType> getUploadUri(upload: Upload<MetadataType>): String {
        return "${imagesBaseUrl}/${upload.name}"
    }
}
