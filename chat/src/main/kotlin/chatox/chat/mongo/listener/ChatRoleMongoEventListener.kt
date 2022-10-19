package chatox.chat.mongo.listener

import chatox.chat.model.ChatRole
import chatox.platform.cache.ReactiveCacheService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent
import org.springframework.stereotype.Component

@Component
class ChatRoleMongoEventListener : AbstractMongoEventListener<ChatRole>() {
    @Autowired
    @Qualifier("chatRoleCacheService")
    private lateinit var chatRoleCache: ReactiveCacheService<ChatRole, String>

    @Autowired
    @Qualifier("defaultChatRoleCacheService")
    private lateinit var defaultChatRoleCache: ReactiveCacheService<ChatRole, String>

    override fun onAfterSave(event: AfterSaveEvent<ChatRole>) {
        chatRoleCache.put(event.source).subscribe()

        if (event.source.default) {
            defaultChatRoleCache.put(event.source).subscribe()
        }
    }
}