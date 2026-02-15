package chatox.sticker.mapper

import chatox.platform.upload.ChatoxUploadsConfigProperties
import chatox.sticker.api.response.UploadResponse
import chatox.sticker.messaging.rabbitmq.event.UploadCreated
import chatox.sticker.model.ImageUploadMetadata
import chatox.sticker.model.Upload
import org.springframework.stereotype.Component

@Component
class UploadMapper(private val uploadsProperties: ChatoxUploadsConfigProperties) {

    fun <MetadataType> toUploadResponse(upload: Upload<MetadataType>): UploadResponse<MetadataType> = UploadResponse(
        id = upload.id,
        type = upload.type,
        name = upload.name,
        extension = upload.extension,
        mimeType = upload.mimeType,
        meta = upload.meta,
        preview = if (upload.imagePreview != null) toUploadResponse(upload.imagePreview) else null,
        uri = uploadsProperties.getUploadUrl(upload.type, upload.name),
        originalName = upload.originalName,
        size = upload.size
    )

    fun <MetadataType> fromUploadCreated(
        uploadCreated: UploadCreated<MetadataType>,
        preview: UploadCreated<ImageUploadMetadata>? = null
    ): Upload<MetadataType> = Upload(
        id = uploadCreated.id,
        imagePreview = if (preview != null) fromUploadCreated(preview) else null,
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
}
