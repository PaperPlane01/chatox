package chatox.sticker.support.converter

import org.springframework.core.convert.converter.Converter
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.util.Date

class ZonedDateTimeReadConverter : Converter<Date, ZonedDateTime> {

    override fun convert(date: Date): ZonedDateTime? {
        return date.toInstant().atZone(ZoneOffset.UTC)
    }
}
