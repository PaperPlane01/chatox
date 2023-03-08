package chatox.chat.mongo.listener

import chatox.chat.model.UserBlacklistItem
import chatox.platform.cache.ReactiveCacheService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent
import org.springframework.stereotype.Component

@Component
class UserBlacklistItemMongoEventListener : AbstractMongoEventListener<UserBlacklistItem>() {
    @Autowired
    private lateinit var userBlacklistItemCacheService: ReactiveCacheService<UserBlacklistItem, String>

    override fun onAfterSave(event: AfterSaveEvent<UserBlacklistItem>) {
        userBlacklistItemCacheService.put(event.source)
    }
}