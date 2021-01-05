package chatox.oauth2.messaging.rabbitmq.event.listener;

import chatox.oauth2.mapper.GlobalBanMapper;
import chatox.oauth2.messaging.rabbitmq.event.GlobalBanCreatedOrUpdated;
import chatox.oauth2.respository.GlobalBanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Transactional
@RequiredArgsConstructor
@Slf4j
public class GlobalBanEventsListener {
    private final GlobalBanRepository globalBanRepository;
    private final GlobalBanMapper globalBanMapper;

    @RabbitListener(queues = "oauth2_service_global_ban_created")
    public void onGlobalBanCreated(GlobalBanCreatedOrUpdated globalBanCreated) {
        log.debug("globalBanCreated event received: {}", globalBanCreated);
        saveGlobalBan(globalBanCreated);
    }

    @RabbitListener(queues = "oauth2_service_global_ban_updated")
    public void onGlobalBanUpdated(GlobalBanCreatedOrUpdated globalBanUpdated) {
        log.debug("globalBanUpdated event received: {}", globalBanUpdated);
        saveGlobalBan(globalBanUpdated);
    }

    private void saveGlobalBan(GlobalBanCreatedOrUpdated globalBanCreatedOrUpdated) {
        var globalBan = globalBanMapper.fromGlobalBanCreatedOrUpdated(globalBanCreatedOrUpdated);
        log.debug("Saving globalBan {}", globalBan);
        globalBanRepository.save(globalBan);
    }
}
