package chatox.user.mongo.listener

import chatox.user.domain.UserInteraction
import chatox.user.mapper.UserInteractionMapper
import chatox.user.messaging.rabbitmq.event.producer.UserInteractionEventsProducer
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent
import org.springframework.stereotype.Component

@Component
class UserInteractionMongoEventsListener(
        private val userInteractionEventsProducer: UserInteractionEventsProducer,
        private val userInteractionMapper: UserInteractionMapper
) : AbstractMongoEventListener<UserInteraction>() {

    override fun onAfterSave(event: AfterSaveEvent<UserInteraction>) {
        userInteractionEventsProducer.userInteractionCreated(userInteractionMapper.toUserInteractionCreated(event.source))
    }
}