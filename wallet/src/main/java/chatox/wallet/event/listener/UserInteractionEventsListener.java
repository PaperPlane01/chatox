package chatox.wallet.event.listener;

import chatox.wallet.event.UserInteractionCreated;
import chatox.wallet.event.UserInteractionRolledBack;
import chatox.wallet.event.publisher.UserInteractionEventsPublisher;
import chatox.wallet.model.Currency;
import chatox.wallet.repository.BalanceRepository;
import chatox.wallet.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserInteractionEventsListener {
    private final BalanceService balanceService;
    private final BalanceRepository balanceRepository;
    private final UserInteractionEventsPublisher userInteractionEventsPublisher;

    @RabbitListener(queues = "wallet_service_user_interaction_created")
    public void onUserInteractionCreated(UserInteractionCreated userInteractionCreated) {
        var balanceOptional = balanceRepository
                .findByUserIdAndCurrency(userInteractionCreated.getUserId(), Currency.COIN)
                .filter(balance -> balance.getAmount().compareTo(userInteractionCreated.getCost()) >= 0);

        if (balanceOptional.isEmpty()) {
            userInteractionEventsPublisher.userInteractionRolledBack(
                    new UserInteractionRolledBack(userInteractionCreated.getId())
            );
            return;
        }

        var balance = balanceOptional.get();
        balanceService.updateBalance(balance, userInteractionCreated);
    }
}
