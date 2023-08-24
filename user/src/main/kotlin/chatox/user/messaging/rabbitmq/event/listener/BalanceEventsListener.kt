package chatox.user.messaging.rabbitmq.event.listener

import chatox.user.messaging.rabbitmq.event.BalanceUpdated
import chatox.user.service.BalanceService
import com.rabbitmq.client.Channel
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.support.AmqpHeaders
import org.springframework.messaging.handler.annotation.Header
import org.springframework.stereotype.Component

@Component
class BalanceEventsListener(private val balanceService: BalanceService) {
    private val log = LoggerFactory.getLogger(this.javaClass)

    @RabbitListener(queues = ["user_service_balance_updated"])
    fun onBalanceUpdated(balanceUpdated: BalanceUpdated,
                         channel: Channel,
                         @Header(AmqpHeaders.DELIVERY_TAG) tag: Long) {
        log.info("Received balanceUpdated event $balanceUpdated")

        balanceService
                .handleBalanceUpdate(balanceUpdated)
                .doOnSuccess { channel.basicAck(tag, false) }
                .doOnError { channel.basicNack(tag, false, true) }
                .subscribe()
    }
}