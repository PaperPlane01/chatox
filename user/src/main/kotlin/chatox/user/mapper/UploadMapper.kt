package chatox.user.mapper

import chatox.user.api.response.UploadResponse
import chatox.user.domain.ImageUploadMetadata
import chatox.user.domain.Upload
import chatox.user.domain.User
import chatox.user.messaging.rabbitmq.event.UploadCreated
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class UploadMapper {
    @Value("\${uploads.images}")
    private lateinit var imagesBaseUrl: String

    fun <MetadataType>toUploadResponse(upload: Upload<MetadataType>): UploadResponse<MetadataType> = UploadResponse(
            id = upload.id,
            type = upload.type,
            name = upload.name,
            extension = upload.extenstion,
            mimeType = upload.mimeType,
            meta = upload.meta,
            preview = if (upload.preview != null) toUploadResponse(upload.preview!!) else null,
            uri = "${imagesBaseUrl}/${upload.name}",
            originalName = upload.originalName
    )

    fun <MetadataType>fromUploadCreated(uploadCreated: UploadCreated<MetadataType>,
                                        preview: Upload<ImageUploadMetadata>?,
                                        user: User?
    ): Upload<MetadataType> = Upload(
            id = uploadCreated.id,
            preview = preview,
            meta = uploadCreated.meta,
            extenstion = uploadCreated.extension,
            name = uploadCreated.name,
            isPreview = uploadCreated.isPreview,
            isThumbnail = uploadCreated.isThumbnail,
            mimeType = uploadCreated.mimeType,
            size = uploadCreated.size,
            type = uploadCreated.type,
            user = user,
            originalName = uploadCreated.originalName
    )
}
