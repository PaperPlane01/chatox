package chatox.chat.mapper

import chatox.chat.api.response.UploadResponse
import chatox.chat.model.ImageUploadMetadata
import chatox.chat.model.Upload
import chatox.chat.model.User
import chatox.chat.messaging.rabbitmq.event.UploadCreated
import chatox.chat.model.UploadType
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class UploadMapper {
    @Value("\${uploads.images}")
    private lateinit var imagesBaseUrl: String

    @Value("\${uploads.videos}")
    private lateinit var videosBaseUrl: String

    @Value("\${uploads.audios}")
    private lateinit var audiosBaseUrl: String

    @Value("\${uploads.files}")
    private lateinit var filesBaseUrl: String

    fun <MetadataType>toUploadResponse(upload: Upload<MetadataType>): UploadResponse<MetadataType> = UploadResponse(
            id = upload.id,
            type = upload.type,
            name = upload.name,
            extension = upload.extension,
            mimeType = upload.mimeType,
            meta = upload.meta,
            preview = if (upload.imagePreview != null) toUploadResponse(upload.imagePreview!!) else null,
            uri = getUploadUri(upload = upload),
            originalName = upload.originalName,
            size = upload.size
    )

    fun <MetadataType>fromUploadCreated(uploadCreated: UploadCreated<MetadataType>,
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

    private fun <MetadataType>getUploadUri(upload: Upload<MetadataType>): String {
        return when (upload.type) {
            UploadType.IMAGE -> "${imagesBaseUrl}/${upload.name}"
            UploadType.GIF -> "${imagesBaseUrl}/${upload.name}"
            UploadType.AUDIO -> "${audiosBaseUrl}/${upload.name}"
            UploadType.VOICE_MESSAGE -> "${audiosBaseUrl}/${upload.name}"
            UploadType.VIDEO -> "${videosBaseUrl}/${upload.name}"
            UploadType.FILE -> "${filesBaseUrl}/${upload.name}"
        }
    }
}
