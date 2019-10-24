package chatox.chat.model

import com.fasterxml.jackson.annotation.JsonCreator
import java.lang.IllegalArgumentException

enum class ChatRole {
    USER,
    MODERATOR,
    ADMIN;

    companion object {
        @JsonCreator
        fun fromJsonValue(value: String): ChatRole {
            for (role: ChatRole in ChatRole.values()) {
                if (role.name.contentEquals(value)) {
                    return role
                }
            }

            throw IllegalArgumentException()
        }
    }
}
