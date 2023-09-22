package chatox.user.api.request

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull

data class DeleteMultipleUserProfilePhotosRequest(
        @field:JsonProperty("userProfilePhotosIds")
        @field:NotNull
        @field:NotEmpty
        private val _userProfilePhotosIds: List<String>?
) {
    val userProfilePhotosIds: List<String>
        get() = _userProfilePhotosIds!!
}
