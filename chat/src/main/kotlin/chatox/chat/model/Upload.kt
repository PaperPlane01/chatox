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
) {
        override fun toString(): String {
                return "Upload(id='$id', name='$name', originalName='$originalName', type=$type, meta=$meta, extension=$extension, mimeType='$mimeType', size=$size, isPreview=$isPreview, isThumbnail=$isThumbnail, preview=$preview)"
        }
}
