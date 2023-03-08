package chatox.chat.mongo.listener

import chatox.chat.config.RedisConfig
import chatox.chat.model.Chat
import chatox.chat.repository.elasticsearch.ChatElasticsearchRepository
import chatox.platform.cache.ReactiveCacheService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent
import org.springframework.stereotype.Component

@Component
class ChatMongoEventListener : AbstractMongoEventListener<Chat>() {
    @Autowired
    @Qualifier(RedisConfig.CHAT_BY_ID_CACHE_SERVICE)
    private lateinit var chatByIdCache: ReactiveCacheService<Chat, String>

    @Autowired
    @Qualifier(RedisConfig.CHAT_BY_SLUG_CACHE_SERVICE)
    private lateinit var chatBySlugCache: ReactiveCacheService<Chat, String>

    @Autowired
    private lateinit var chatElasticSearchRepository: ChatElasticsearchRepository

    override fun onAfterSave(event: AfterSaveEvent<Chat>) {
        val chat = event.source
        chatByIdCache.put(chat).subscribe()
        chatBySlugCache.put(chat).subscribe()
        chatElasticSearchRepository.save(chat.toElasticsearch()).subscribe()
    }
}
