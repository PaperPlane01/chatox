package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.DBRef

data class Upload<MetadataType>(
        @Id
        var id: String,
        var name: String,
        var originalName: String,
        var type: UploadType,
        var meta: MetadataType?,
        var extension: String?,
        var mimeType: String,
        var size: Int,
        var isPreview: Boolean,
        var isThumbnail: Boolean,
        @DBRef(lazy = true)
        var preview: Upload<ImageUploadMetadata>?,
        @DBRef(lazy = true)
        var user: User?
)
