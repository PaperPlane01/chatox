package chatox.user.api.response

import chatox.user.domain.ImageUploadMetadata

data class UserProfilePhotoResponse(
        val id: String,
        val upload: UploadResponse<ImageUploadMetadata>
)
