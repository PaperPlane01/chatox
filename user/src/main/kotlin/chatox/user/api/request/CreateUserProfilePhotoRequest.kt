package chatox.user.api.request

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotNull

data class CreateUserProfilePhotoRequest(
        @field:NotNull
        @field:JsonProperty("uploadId")
        private val _uploadId: String?,

        val setAsAvatar: Boolean? = false
) {
    val uploadId: String
        get() = _uploadId!!
}
