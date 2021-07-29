package chatox.sticker.model

import com.fasterxml.jackson.annotation.JsonProperty
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document

@Document
data class Upload<MetadataType>(
        @Id
        val id: String,
        val name: String,
        val originalName: String,
        val type: UploadType,
        val meta: MetadataType?,
        val extension: String?,
        val mimeType: String,
        val size: Int,

        @JsonProperty("isPreview")
        val isPreview: Boolean = false,
        val isThumbnail: Boolean,

        @JsonProperty("imagePreview")
        val imagePreview: Upload<ImageUploadMetadata>?,

        @Indexed
        val userId: String? = null
)
