package chatox.chat.support.datetime

import org.springframework.data.auditing.DateTimeProvider
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.temporal.TemporalAccessor
import java.util.Optional

class CustomDateTimeProvider : DateTimeProvider {
    override fun getNow(): Optional<TemporalAccessor> {
        return Optional.of(ZonedDateTime.now(ZoneOffset.UTC))
    }
}
