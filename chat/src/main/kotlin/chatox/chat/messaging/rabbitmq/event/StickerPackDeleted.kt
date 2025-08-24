package chatox.chat.messaging.rabbitmq.event

data class StickerPackDeleted(
        val id: String,
        val deleteMessages: Boolean
)
