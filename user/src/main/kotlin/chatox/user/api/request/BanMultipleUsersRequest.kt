package chatox.user.api.request

import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.Size

data class BanMultipleUsersRequest(
        @field:NotEmpty
        @field:Size(max = 50)
        val bans: List<BanUserRequestWithUserId>
)
