package chatox.user.security

import chatox.user.api.response.GlobalBanResponse
import chatox.user.api.response.UploadResponse
import chatox.user.domain.ImageUploadMetadata
import java.time.ZonedDateTime

data class CurrentUser(
        val id: String,
        val roles: List<String>,
        val firstName: String,
        val lastName: String?,
        val slug: String?,
        val avatar: UploadResponse<ImageUploadMetadata>?,
        val accountId: String,
        val bio: String?,
        val createdAt: ZonedDateTime,
        val dateOfBirth: ZonedDateTime?,
        val email: String?,
        val globalBan: GlobalBanResponse?,
        val externalAvatarUri: String?,
)
