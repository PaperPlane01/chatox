package chatox.chat.support.converter

import org.springframework.core.convert.converter.Converter
import java.time.ZonedDateTime
import java.util.Date

class ZonedDateTimeWriteConverter : Converter<ZonedDateTime, Date> {
    override fun convert(zonedDateTime: ZonedDateTime): Date? {
        return Date.from(zonedDateTime.toInstant())
    }
}
