package chatox.wallet.hibernate;

import chatox.wallet.event.publisher.BalanceEventPublisher;
import chatox.wallet.mapper.BalanceMapper;
import chatox.wallet.model.Balance;
import lombok.RequiredArgsConstructor;
import org.hibernate.event.spi.PostUpdateEvent;
import org.hibernate.event.spi.PostUpdateEventListener;
import org.hibernate.persister.entity.EntityPersister;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BalanceUpdateEventListener implements PostUpdateEventListener {
    private final BalanceEventPublisher balanceEventPublisher;
    private final BalanceMapper balanceMapper;

    @Override
    public void onPostUpdate(PostUpdateEvent event) {
        var entity = event.getEntity();

        if (entity instanceof Balance balance) {
            balanceEventPublisher.balanceUpdated(balanceMapper.toBalanceUpdated(balance));
        }
    }

    @Override
    public boolean requiresPostCommitHandling(EntityPersister persister) {
        return true;
    }
}
