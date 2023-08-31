package chatox.wallet.event.publisher;

import chatox.wallet.event.UserInteractionRolledBack;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserInteractionEventsPublisher {
    private final RabbitTemplate rabbitTemplate;

    public void userInteractionRolledBack(UserInteractionRolledBack userInteractionRolledBack) {
        rabbitTemplate.convertAndSend(
                "user.interactions.events",
                "user.interaction.rolled.back.#",
                userInteractionRolledBack
        );
    }
}
