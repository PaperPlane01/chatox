package chatox.user.messaging.rabbitmq.event.listener

import chatox.user.messaging.rabbitmq.event.AccountDeleted
import chatox.user.service.UserService
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component

@Component
class UserEventsListener(private val userService: UserService) {

    @RabbitListener(queues = ["user_service_account_deleted"])
    fun onAccountDeleted(accountDeleted: AccountDeleted) = userService.deleteUsersByAccount(accountDeleted.id)
}
