package chatox.chat.model

import com.fasterxml.jackson.annotation.JsonCreator
import java.lang.IllegalArgumentException

enum class StandardChatRole(val level: Int) {
    NOT_PARTICIPANT(0),
    USER(1),
    MODERATOR(2),
    ADMIN(3),
    SUPER_ADMIN(4),
    OWNER(5);

    companion object {
        @JsonCreator
        fun fromJsonValue(value: String): StandardChatRole {
            for (role: StandardChatRole in values()) {
                if (role !== NOT_PARTICIPANT && role.name.contentEquals(value)) {
                    return role
                }
            }

            throw IllegalArgumentException()
        }
    }
}
