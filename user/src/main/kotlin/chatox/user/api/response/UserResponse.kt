package chatox.user.api.response

import chatox.user.domain.ImageUploadMetadata
import com.fasterxml.jackson.annotation.JsonInclude
import java.time.ZonedDateTime

data class UserResponse(
        val id: String,
        @field:JsonInclude(JsonInclude.Include.NON_NULL)
        val accountId: String? = null,
        val slug: String?,
        val bio: String?,
        val firstName: String,
        val lastName: String?,
        val createdAt: ZonedDateTime,
        val lastSeen: ZonedDateTime,
        val dateOfBirth: ZonedDateTime?,
        val online: Boolean,
        val anonymous: Boolean,
        @field:JsonInclude(JsonInclude.Include.NON_NULL)
        val email: String? = null,
        val avatar: UploadResponse<ImageUploadMetadata>?
)
