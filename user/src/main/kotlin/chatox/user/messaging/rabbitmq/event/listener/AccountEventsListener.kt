package chatox.user.messaging.rabbitmq.event.listener

import chatox.user.messaging.rabbitmq.event.EmailUpdated
import chatox.user.service.UserService
import com.rabbitmq.client.Channel
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.support.AmqpHeaders
import org.springframework.messaging.handler.annotation.Header
import org.springframework.stereotype.Component

@Component
class AccountEventsListener(private val userService: UserService) {
    private val log = LoggerFactory.getLogger(this.javaClass)

    @RabbitListener(queues = ["user_service_email_updated"])
    fun onEmailUpdated(emailUpdated: EmailUpdated,
                       channel: Channel,
                       @Header(AmqpHeaders.DELIVERY_TAG) tag: Long) {
        log.info("Received emailUpdated event")

        userService.updateEmail(
                accountId = emailUpdated.accountId,
                email = emailUpdated.email
        )
                .doOnSuccess { channel.basicAck(tag, false) }
                .doOnError { channel.basicNack(tag, true ,true) }
                .subscribe()
    }
}