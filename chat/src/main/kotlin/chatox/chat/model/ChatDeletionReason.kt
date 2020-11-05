package chatox.chat.model

import chatox.chat.exception.InvalidChatDeletionReasonException
import com.fasterxml.jackson.annotation.JsonCreator
import java.lang.IllegalArgumentException
import java.util.Arrays

enum class ChatDeletionReason {
    ILLEGAL_CONTENT,
    CHILD_ABUSE,
    PORNOGRAPHY,
    SPAM,
    OTHER;

    companion object {
        @JsonCreator
        fun fromJsonValue(jsonValue: String): ChatDeletionReason {
            for (chatDeletionReason in values()) {
                if (chatDeletionReason.name.contentEquals(jsonValue)) {
                    return chatDeletionReason
                }
            }

            throw InvalidChatDeletionReasonException(
                    "The following chat deletion reason is invalid: ${jsonValue}. Valid values are ${values()}"
            )
        }
    }
}
