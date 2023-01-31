package chatox.oauth2.messaging.rabbitmq.event.publisher;

import chatox.oauth2.messaging.rabbitmq.event.EmailUpdated;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AccountEventsPublisher {
    private final RabbitTemplate rabbitTemplate;

    public void emailUpdated(EmailUpdated emailUpdated) {
        rabbitTemplate.convertAndSend(
                "account.events",
                "account.email.updated.#",
                emailUpdated
        );
    }
}
