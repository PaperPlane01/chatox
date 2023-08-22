package chatox.wallet.hibernate;

import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManagerFactory;
import lombok.RequiredArgsConstructor;
import org.hibernate.event.service.spi.EventListenerRegistry;
import org.hibernate.event.spi.EventType;
import org.hibernate.internal.SessionFactoryImpl;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
class HibernateEventListeners {
    private final EntityManagerFactory entityManagerFactory;
    private final BalanceUpdateEventListener balanceUpdateEventListener;

    @PostConstruct
    void registerListeners() {
        var sessionFactory = entityManagerFactory.unwrap(SessionFactoryImpl.class);
        var registry = sessionFactory.getServiceRegistry().getService(EventListenerRegistry.class);
        registry.getEventListenerGroup(EventType.POST_UPDATE).appendListener(balanceUpdateEventListener);
    }
}
