package chatox.user.mapper

import chatox.user.api.response.UploadResponse
import chatox.user.domain.ImageUploadMetadata
import chatox.user.domain.Upload
import chatox.user.domain.User
import chatox.user.messaging.rabbitmq.event.UploadCreated
import org.springframework.stereotype.Component

@Component
class UploadMapper {

    fun <MetadataType>toUploadResponse(upload: Upload<MetadataType>): UploadResponse<MetadataType> = UploadResponse(
            id = upload.id,
            type = upload.type,
            name = upload.name,
            extension = upload.extenstion,
            mimeType = upload.mimeType,
            meta = upload.meta,
            preview = if (upload.preview != null) toUploadResponse(upload.preview!!) else null,
            thumbnail = if (upload.thumbnail != null) toUploadResponse(upload.thumbnail!!) else null
    )

    fun <MetadataType>fromUploadCreated(uploadCreated: UploadCreated<MetadataType>,
                                        thumbnail: Upload<ImageUploadMetadata>?,
                                        preview: Upload<ImageUploadMetadata>?,
                                        user: User?
    ): Upload<MetadataType> = Upload(
            id = uploadCreated.id,
            thumbnail = thumbnail,
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
