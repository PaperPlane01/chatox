package chatox.user.domain

import chatox.user.exception.InvalidGlobalBanReasonException

enum class GlobalBanReason {
    SPAM,
    FLOOD,
    ILLEGAL_CONTENT,
    PORNOGRAPHY,
    OTHER;

    companion object {
        fun fromJsonValue(jsonValue: String): GlobalBanReason {
            for (globalBanReason in values()) {
                if (globalBanReason.name.contentEquals(jsonValue)) {
                    return globalBanReason
                }
            }

            throw InvalidGlobalBanReasonException()
        }
    }
}
