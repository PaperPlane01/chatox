package chatox.chat.mongo.listener

import chatox.chat.model.Chat
import chatox.platform.cache.ReactiveCacheService
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent
import org.springframework.stereotype.Component

@Component
class ChatMongoEventListener : AbstractMongoEventListener<Chat>() {
    private lateinit var chatCache: ReactiveCacheService<String, Chat>

    override fun onAfterSave(event: AfterSaveEvent<Chat>) {
        chatCache.put(event.source).subscribe()
    }
}
