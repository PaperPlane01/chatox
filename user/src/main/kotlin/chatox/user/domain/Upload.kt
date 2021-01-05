package chatox.user.domain

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class Upload<MetadataType>(
        @Id
        var id: String,
        var name: String,
        var originalName: String,
        var type: UploadType,
        var meta: MetadataType,
        var extenstion: String,
        var mimeType: String,
        var size: Int,
        var isPreview: Boolean,
        var isThumbnail: Boolean,
        @Indexed
        var previewId: String? = null,
        @Indexed
        var userId: String? = null
)
