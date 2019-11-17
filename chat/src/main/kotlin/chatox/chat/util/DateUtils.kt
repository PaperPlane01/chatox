package chatox.chat.util

import java.util.Date

fun isDateBeforeOrEquals(dateToCheck: Date, dateToCompareWith: Date): Boolean {
    return dateToCheck.before(dateToCompareWith) || dateToCheck == dateToCompareWith
}

fun isDateAfterOrEquals(dateToCheck: Date, dateToCompareWith: Date): Boolean {
    return dateToCheck.after(dateToCompareWith) || dateToCheck === dateToCompareWith
}
