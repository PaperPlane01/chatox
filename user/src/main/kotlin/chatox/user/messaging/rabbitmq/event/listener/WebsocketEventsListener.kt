package chatox.user.messaging.rabbitmq.event.listener

import chatox.user.messaging.rabbitmq.event.UserConnected
import chatox.user.messaging.rabbitmq.event.UserDisconnected
import chatox.user.service.UserSessionService
import com.rabbitmq.client.Channel
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.support.AmqpHeaders
import org.springframework.messaging.handler.annotation.Header
import org.springframework.stereotype.Component

@Component
class WebsocketEventsListener(private val userSessionService: UserSessionService) {

    @RabbitListener(queues = ["user_service_user_connected"])
    fun onUserConnected(userConnected: UserConnected,
                        channel: Channel,
                        @Header(AmqpHeaders.DELIVERY_TAG) tag: Long) {
        userSessionService.userConnected(userConnected)
                .doOnSuccess { channel.basicAck(tag, false) }
                .doOnError { channel.basicNack(tag, false, true) }
                .subscribe()
    }

    @RabbitListener(queues = ["user_service_user_disconnected"])
    fun onUserDisconnected(userDisconnected: UserDisconnected,
                           channel: Channel,
                           @Header(AmqpHeaders.DELIVERY_TAG) tag: Long) {
        userSessionService.userDisconnected(userDisconnected)
                .doOnSuccess { channel.basicAck(tag, false) }
                .doOnError { channel.basicNack(tag, false, true) }
                .subscribe()
    }
}
