package chatox.chat.mongo.listener

import chatox.chat.model.Chat
import chatox.platform.cache.ReactiveCacheService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent
import org.springframework.stereotype.Component

@Component
class ChatMongoEventListener : AbstractMongoEventListener<Chat>() {
    @Autowired
    private lateinit var chatCache: ReactiveCacheService<Chat, String>

    override fun onAfterSave(event: AfterSaveEvent<Chat>) {
        chatCache.put(event.source).subscribe()
    }
}
