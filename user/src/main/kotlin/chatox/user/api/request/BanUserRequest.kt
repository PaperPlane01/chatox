package chatox.user.api.request

import chatox.user.domain.GlobalBanReason
import chatox.user.support.validation.globalban.annotation.RequireCommentIfGlobalBanReasonIs
import chatox.user.support.validation.globalban.annotation.RequireExpirationDateIfBanIsNotPermanent
import java.time.ZonedDateTime
import javax.validation.constraints.Future
import javax.validation.constraints.NotNull

@RequireCommentIfGlobalBanReasonIs(reasons = [GlobalBanReason.OTHER])
@RequireExpirationDateIfBanIsNotPermanent
data class BanUserRequest(
        @field:Future
        val expiresAt: ZonedDateTime?,

        @field:NotNull
        val _reason: GlobalBanReason?,
        val permanent: Boolean = false,
        val comment: String?
) {
    val reason: GlobalBanReason
                get() = _reason!!
}
