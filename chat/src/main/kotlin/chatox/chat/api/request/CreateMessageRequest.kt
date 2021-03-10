package chatox.chat.api.request

import chatox.chat.support.validation.annotation.AllowFieldToBeBlankIfOtherFieldIsNotEmpty
import chatox.chat.support.validation.annotation.MaxIntervalFromNow
import chatox.chat.support.validation.annotation.MinIntervalFromNow
import chatox.chat.support.validation.annotation.StringIn
import com.fasterxml.jackson.annotation.JsonProperty
import java.time.ZonedDateTime
import java.time.temporal.ChronoUnit
import javax.validation.constraints.Future
import javax.validation.constraints.Size

@AllowFieldToBeBlankIfOtherFieldIsNotEmpty(
        checkedField = "_text",
        otherField = "uploadAttachments"
)
data class CreateMessageRequest(
        @field:Size(max = 2000)
        @field:JsonProperty("text")
        private val _text: String?,
        val referredMessageId: String?,

        @field:StringIn(["apple", "facebook", "twitter", "native"])
        val emojisSet: String = "apple",

        @field:Size(max = 10)
        val uploadAttachments: List<String> = listOf(),

        @field:Future
        @field:MinIntervalFromNow(
                value = 5,
                chronoUnit = ChronoUnit.MINUTES,
                message = "Scheduled message must be scheduled at least 5 minutes from now"
        )
        @field:MaxIntervalFromNow(
                value = 1,
                chronoUnit = ChronoUnit.MONTHS,
                message = "Scheduled message date must be no more than 30 days from now"
        )
        val scheduledAt: ZonedDateTime?
) {
        val text: String
                get() = _text!!
}
