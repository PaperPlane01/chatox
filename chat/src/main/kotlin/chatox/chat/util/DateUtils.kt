package chatox.chat.util

import java.time.LocalDateTime
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.temporal.ChronoUnit
import java.util.Date
import kotlin.math.abs

fun isDateBeforeOrEquals(dateToCheck: Date, dateToCompareWith: Date): Boolean {
    return dateToCheck.before(dateToCompareWith) || dateToCheck == dateToCompareWith
}

fun isDateBeforeOrEquals(dateToCheck: ZonedDateTime, dateToCompareWith: ZonedDateTime): Boolean {
    return dateToCheck.isBefore(dateToCompareWith) || dateToCheck === dateToCompareWith;
}

fun isDateAfterOrEquals(dateToCheck: Date, dateToCompareWith: Date): Boolean {
    return dateToCheck.after(dateToCompareWith) || dateToCheck === dateToCompareWith
}

fun getDifferenceInSeconds(left: Date, right: Date): Long {
    val leftLocalDateTime = left.toInstant().atZone(ZoneId.of("UTC")).toLocalDateTime()
    val rightLocalDateTime = right.toInstant().atZone(ZoneId.of("UTC")).toLocalDateTime()

    return abs(ChronoUnit.SECONDS.between(leftLocalDateTime, rightLocalDateTime))
}
