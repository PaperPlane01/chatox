package chatox.chat.util

enum class BoundMode {
    INCLUSIVE,
    EXCLUSIVE
}

data class Bound(val value: Int?, val mode: BoundMode)

fun isBetween(number: Int, lowerBound: Bound, upperBound: Bound): Boolean {
    if (lowerBound.value == null && upperBound.value == null) {
        return true
    }

    val satisfiesLowerBound = if (lowerBound.value != null) {
        if (lowerBound.mode == BoundMode.INCLUSIVE) number >= lowerBound.value else number > lowerBound.value
    } else {
        true
    }
    val satisfiedUpperBound = if (upperBound.value != null) {
        if (upperBound.mode == BoundMode.INCLUSIVE) number <= upperBound.value else number < upperBound.value
    } else {
        true
    }

    return satisfiesLowerBound && satisfiedUpperBound
}