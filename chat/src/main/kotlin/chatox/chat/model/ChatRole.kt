package chatox.chat.model

import com.fasterxml.jackson.annotation.JsonCreator
import java.lang.IllegalArgumentException

enum class ChatRole {
    USER,
    MODERATOR,
    ADMIN,
    NOT_PARTICIPANT;

    companion object {
        @JsonCreator
        fun fromJsonValue(value: String): ChatRole {
            for (role: ChatRole in values()) {
                if (role !== NOT_PARTICIPANT && role.name.contentEquals(value)) {
                    return role
                }
            }

            throw IllegalArgumentException()
        }
    }
}
