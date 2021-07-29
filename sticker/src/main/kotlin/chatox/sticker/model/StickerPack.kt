package chatox.sticker.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document
data class StickerPack<PreviewMetadataType>(
        @Id
        val id: String,

        @Indexed
        val name: String,

        @Indexed
        val author: String?,
        val description: String,

        @Indexed
        val createdBy: String,
        val createdAt: ZonedDateTime,
        val updatedAt: ZonedDateTime? = null,
        val preview: Upload<PreviewMetadataType>
)
