package chatox.sticker.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document
data class StickerPackInstallation(
        @Id
        val id: String,

        @Indexed
        val userId: String,

        @Indexed
        val stickerPackId: String,
        val createdAt: ZonedDateTime
)
