package chatox.chat.mongo.listener

import chatox.chat.model.User
import chatox.platform.cache.ReactiveCacheService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent
import org.springframework.stereotype.Component

@Component
class UserMongoEventListener : AbstractMongoEventListener<User>() {
    @Autowired
    private lateinit var userCache: ReactiveCacheService<User, String>

    override fun onAfterSave(event: AfterSaveEvent<User>) {
        userCache.put(event.source).subscribe()
    }
}
