package chatox.wallet.event.publisher;

import chatox.wallet.event.BalanceUpdated;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BalanceEventPublisher {
    private final RabbitTemplate rabbitTemplate;

    public void balanceUpdated(BalanceUpdated balanceUpdated) {
        rabbitTemplate.convertAndSend(
                "balance.events",
                "balance.updated.#",
                balanceUpdated
        );
    }
}
