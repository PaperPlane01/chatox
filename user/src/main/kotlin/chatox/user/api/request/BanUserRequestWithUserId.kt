package chatox.user.api.request

import chatox.user.domain.GlobalBanReason
import chatox.user.support.validation.globalban.annotation.RequireCommentIfGlobalBanReasonIs
import chatox.user.support.validation.globalban.annotation.RequireExpirationDateIfBanIsNotPermanent
import com.fasterxml.jackson.annotation.JsonProperty
import java.time.ZonedDateTime
import javax.validation.constraints.Future
import javax.validation.constraints.NotNull

@RequireCommentIfGlobalBanReasonIs(reasons = [GlobalBanReason.OTHER])
@RequireExpirationDateIfBanIsNotPermanent
data class BanUserRequestWithUserId(
        @field:NotNull
        @field:JsonProperty("userId")
        private val _userId: String?,

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

    val userId: String
        get() = _userId!!
}
