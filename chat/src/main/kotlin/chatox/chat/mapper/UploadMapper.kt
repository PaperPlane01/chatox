package chatox.chat.mapper

import chatox.chat.api.response.UploadResponse
import chatox.chat.messaging.rabbitmq.event.UploadCreated
import chatox.chat.model.ImageUploadMetadata
import chatox.chat.model.Upload
import chatox.chat.model.User
import chatox.platform.upload.ChatoxUploadsConfigProperties
import org.springframework.stereotype.Component

@Component
class UploadMapper(private val uploadConfig: ChatoxUploadsConfigProperties) {

    fun <MetadataType> toUploadResponse(upload: Upload<MetadataType>): UploadResponse<MetadataType> = UploadResponse(
        id = upload.id,
        type = upload.type,
        name = upload.name,
        extension = upload.extension,
        mimeType = upload.mimeType,
        meta = upload.meta,
        preview = if (upload.imagePreview != null) toUploadResponse(upload.imagePreview) else null,
        uri = uploadConfig.getUploadUrl(upload.type, upload.name),
        originalName = upload.originalName,
        size = upload.size
    )

    fun <MetadataType> fromUploadCreated(
        uploadCreated: UploadCreated<MetadataType>,
        preview: Upload<ImageUploadMetadata>?,
        user: User?
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
        userId = user?.id,
        originalName = uploadCreated.originalName
    )
}
