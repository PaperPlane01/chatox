package chatox.user.messaging.rabbitmq.event.listener

import chatox.user.messaging.rabbitmq.event.UserConnected
import chatox.user.messaging.rabbitmq.event.UserDisconnected
import chatox.user.service.UserSessionService
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class WebsocketEventsListener(private val userSessionService: UserSessionService) {

    @RabbitListener(queues = ["user_service_user_connected"])
    fun onUserConnected(userConnected: UserConnected) = userSessionService.userConnected(userConnected)

    fun onUserDisconnected(userDisconnected: UserDisconnected) = userSessionService.userDisconnected(userDisconnected)
}
