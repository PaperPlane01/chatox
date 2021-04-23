package chatox.user.api.request

import javax.validation.constraints.NotEmpty
import javax.validation.constraints.Size

data class BanMultipleUsersRequest(
        @field:NotEmpty
        @field:Size(max = 50)
        val bans: List<BanUserRequestWithUserId>
)
