package chatox.chat.mongo.listener

import chatox.chat.model.User
import chatox.platform.cache.ReactiveCacheService
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent
import org.springframework.stereotype.Component

@Component
class UserMongoEventListener : AbstractMongoEventListener<User>() {
    private lateinit var userCache: ReactiveCacheService<String, User>

    override fun onAfterSave(event: AfterSaveEvent<User>) {
        userCache.put(event.source).subscribe()
    }
}
