package chatox.chat.model

import com.fasterxml.jackson.annotation.JsonCreator
import java.lang.IllegalArgumentException

enum class ChatType {
    GROUP,
    DIALOG;

    companion object {
        @JsonCreator
        fun fromJsonValue(value: String): ChatType {
            for (chatType: ChatType in values()) {
                if (chatType.name.contentEquals(value)) {
                    return chatType
                }
            }

            throw IllegalArgumentException()
        }
    }
}
