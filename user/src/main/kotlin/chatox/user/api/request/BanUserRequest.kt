package chatox.user.api.request

import chatox.user.domain.GlobalBanReason
import chatox.user.support.validation.globalban.annotation.RequireCommentIfGlobalBanReasonIs
import chatox.user.support.validation.globalban.annotation.RequireExpirationDateIfBanIsNotPermanent
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.Future
import jakarta.validation.constraints.NotNull
import java.time.ZonedDateTime

@RequireCommentIfGlobalBanReasonIs(reasons = [GlobalBanReason.OTHER])
@RequireExpirationDateIfBanIsNotPermanent
data class BanUserRequest(
        @field:Future
        val expiresAt: ZonedDateTime?,

        @field:NotNull
        @field:JsonProperty("reason")
        private val _reason: GlobalBanReason?,
        val permanent: Boolean = false,
        val comment: String?
) {
    val reason: GlobalBanReason
                get() = _reason!!
}
