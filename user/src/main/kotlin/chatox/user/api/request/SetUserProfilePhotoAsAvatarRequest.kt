package chatox.user.api.request

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotNull

data class SetUserProfilePhotoAsAvatarRequest(
        @field:NotNull
        @field:JsonProperty("setAsAvatar")
        private val _setAsAvatar: Boolean?
) {
    val setAsAvatar: Boolean
        get() = _setAsAvatar!!
}
