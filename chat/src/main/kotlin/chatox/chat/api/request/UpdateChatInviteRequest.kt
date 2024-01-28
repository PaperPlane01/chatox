package chatox.chat.api.request

import chatox.chat.model.JoinChatAllowance
import chatox.platform.security.VerificationLevel
import jakarta.validation.constraints.Future
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size
import java.time.ZonedDateTime

data class UpdateChatInviteRequest(
        val active: Boolean?,

        @field:Size(max = 50)
        val name: String?,

        @field:Future
        val expiresAt: ZonedDateTime?,

        @field:Positive
        @field:Max(1_000_000_000)
        val maxUseTimes: Long?,

        val userId: String?,

        val joinAllowanceSettings: Map<VerificationLevel, JoinChatAllowance>?
)
