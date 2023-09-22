package chatox.user.domain

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document
data class UserProfilePhoto(
        @Id
        val id: String,

        @Indexed
        val userId: String,

        val upload: Upload<ImageUploadMetadata>,
        val createdAt: ZonedDateTime
)
