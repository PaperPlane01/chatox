package chatox.user.mongo.listener

import chatox.platform.cache.ReactiveCacheService
import chatox.user.domain.UserInteractionCost
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent
import org.springframework.stereotype.Component

@Component
class UserInteractionCostMongoEventsListener(
        private val userInteractionCostCache: ReactiveCacheService<UserInteractionCost, String>
) : AbstractMongoEventListener<UserInteractionCost>() {

    override fun onAfterSave(event: AfterSaveEvent<UserInteractionCost>) {
        userInteractionCostCache.put(event.source).subscribe()
    }
}