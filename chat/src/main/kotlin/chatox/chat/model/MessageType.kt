package chatox.chat.model

import java.lang.IllegalArgumentException
import kotlin.reflect.KClass

enum class MessageType {
    REGULAR,
    SCHEDULED,
    DRAFT;

    companion object {
        private val TYPES_MAP: Map<KClass<out MessageInterface>, MessageType> = mapOf(
                Pair(Message::class, REGULAR),
                Pair(ScheduledMessage::class, SCHEDULED),
                Pair(DraftMessage::class, DRAFT)
        )

        @JvmStatic
        fun fromClass(clazz: KClass<out MessageInterface>): MessageType {
            return TYPES_MAP[clazz]
                    ?: throw IllegalArgumentException("Invalid message class ${clazz.qualifiedName}")
        }
    }
}