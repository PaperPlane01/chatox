package chatox.chat.model

enum class NotificationLevel(val value: Int) {
    MUTED(0),
    MENTIONS_AND_REPLIES(1),
    ALL_MESSAGES(2)
}