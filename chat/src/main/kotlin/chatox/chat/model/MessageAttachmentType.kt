package chatox.chat.model

import com.fasterxml.jackson.annotation.JsonCreator
import java.lang.IllegalArgumentException
import java.util.Arrays

enum class MessageAttachmentType {
    PHOTO,
    VIDEO,
    STICKER,
    FILE;

    companion object {
        @JsonCreator
        fun fromString(value: String): MessageAttachmentType {
            for (type: MessageAttachmentType in MessageAttachmentType.values()) {
                if (type.name.contentEquals(value)) {
                    return type
                }
            }

            throw IllegalArgumentException()
        }
    }
}
