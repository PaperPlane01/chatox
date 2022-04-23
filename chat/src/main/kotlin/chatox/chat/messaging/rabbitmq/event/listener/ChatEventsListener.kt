package chatox.chat.messaging.rabbitmq.event.listener

import chatox.chat.api.response.MessageResponse
import chatox.chat.repository.mongodb.ChatRepository
import com.rabbitmq.client.Channel
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.support.AmqpHeaders
import org.springframework.messaging.handler.annotation.Header
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
@Transactional
class ChatEventsListener(private val chatRepository: ChatRepository) {

    @RabbitListener(queues = ["chat_service_message_created"])
    fun onMessageCreated(message: MessageResponse, channel: Channel, @Header(AmqpHeaders.DELIVERY_TAG) tag: Long) {
        mono {
            val chat = chatRepository.findById(message.chatId).awaitFirst()

            chatRepository.save(chat.copy(
                    lastMessageId = message.id,
                    lastMessageDate = message.createdAt
            ))
                    .awaitFirst()
        }
                .doOnSuccess { channel.basicAck(tag, false) }
                .doOnError { channel.basicNack(tag, false, true) }
                .subscribe()
    }
}
