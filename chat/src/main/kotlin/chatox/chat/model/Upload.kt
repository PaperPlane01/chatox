package chatox.chat.model

import com.fasterxml.jackson.annotation.JsonProperty
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed

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
        @JsonProperty("isPreview")
        var isPreview: Boolean = false,
        var isThumbnail: Boolean,
        @JsonProperty("imagePreview")
        var imagePreview: Upload<ImageUploadMetadata>?,

        @Indexed
        var userId: String? = null
)
