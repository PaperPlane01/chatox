package chatox.chat.api.request

import chatox.platform.validation.annotation.AllowedChronoUnits
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.time.temporal.ChronoUnit

data class UpdateSlowModeRequest(
        @field:JsonProperty("enabled")
        @field:NotNull
        private val _enabled: Boolean?,

        @field:JsonProperty("interval")
        @field:NotNull
        @field:Positive
        private val _interval: Long?,

        @field:JsonProperty("unit")
        @field:NotNull
        @field:AllowedChronoUnits(value = [ChronoUnit.SECONDS, ChronoUnit.MINUTES, ChronoUnit.HOURS])
        private val _unit: ChronoUnit?
) {
    val enabled: Boolean
        get() = _enabled!!

    val interval: Long
        get() = _interval!!

    val unit: ChronoUnit
        get() = _unit!!
}
