package chatox.user.mongo.listener

import chatox.platform.cache.ReactiveCacheService
import chatox.user.config.RedisConfig
import chatox.user.domain.User
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent
import org.springframework.stereotype.Component

@Component
class UserMongoEventsListener : AbstractMongoEventListener<User>() {
    @Autowired
    @Qualifier(RedisConfig.USER_BY_ID_CACHE)
    private lateinit var userByIdCache: ReactiveCacheService<User, String>

    @Autowired
    @Qualifier(RedisConfig.USER_BY_SLUG_CACHE)
    private lateinit var userBySlugCache: ReactiveCacheService<User, String>

    override fun onAfterSave(event: AfterSaveEvent<User>) {
        userByIdCache.put(event.source).subscribe()
        userBySlugCache.put(event.source).subscribe()
    }
}
