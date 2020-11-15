package chatox.chat.support.datetime

import org.springframework.stereotype.Component
import java.time.ZonedDateTime

@Component
class TimeService {
    fun now(): ZonedDateTime = ZonedDateTime.now()
}
