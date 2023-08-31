package chatox.user.messaging.rabbitmq.event.listener

import chatox.user.messaging.rabbitmq.event.UserInteractionRolledBack
import chatox.user.service.UserInteractionService
import com.rabbitmq.client.Channel
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.support.AmqpHeaders
import org.springframework.messaging.handler.annotation.Header
import org.springframework.stereotype.Component

@Component
class UserInteractionEventsListener(private val userInteractionService: UserInteractionService) {

    @RabbitListener(queues = ["user_service_user_interaction_rolled_back"])
    fun onUserInteractionRolledBack(
            userInteractionRolledBack: UserInteractionRolledBack,
            channel: Channel,
            @Header(AmqpHeaders.DELIVERY_TAG) tag: Long) {
        userInteractionService
                .rollbackUserInteraction(userInteractionRolledBack.userInteractionId)
                .doOnSuccess { channel.basicAck(tag, false) }
                .doOnError { channel.basicNack(tag, false, true) }
                .subscribe()
    }
}