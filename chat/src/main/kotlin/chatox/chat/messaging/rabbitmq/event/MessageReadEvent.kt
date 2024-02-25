package chatox.chat.messaging.rabbitmq.event

import java.time.ZonedDateTime

data class MessageReadEvent(
      val messageId: String,
      val chatId: String,
      val messageSenderId: String,
      val messageCreatedAt: ZonedDateTime,
      val messageReadAt: ZonedDateTime
)
