package chatox.chat.mongo.listener

import chatox.chat.model.ChatInvite
import chatox.platform.cache.ReactiveCacheService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent
import org.springframework.stereotype.Component

@Component
class ChatInviteMongoEventListener : AbstractMongoEventListener<ChatInvite>() {
    @Autowired
    private lateinit var chatInviteCacheService: ReactiveCacheService<ChatInvite, String>

    override fun onAfterSave(event: AfterSaveEvent<ChatInvite>) {
        chatInviteCacheService.put(event.source).subscribe()
    }
}