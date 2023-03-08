package chatox.chat.mongo.listener

import chatox.chat.model.ChatBlocking
import chatox.chat.repository.mongodb.ChatParticipationRepository
import chatox.platform.cache.ReactiveCacheService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent
import org.springframework.stereotype.Component

@Component
class ChatBlockingMongoEventListener : AbstractMongoEventListener<ChatBlocking>() {
    @Autowired
    private lateinit var chatParticipationRepository: ChatParticipationRepository

    @Autowired
    private lateinit var chatBlockingCache: ReactiveCacheService<ChatBlocking, String>

    override fun onAfterSave(event: AfterSaveEvent<ChatBlocking>) {
        chatBlockingCache.put(event.source).subscribe()

        chatParticipationRepository.findByChatIdAndUserId(
                chatId = event.source.chatId,
                userId = event.source.blockedUserId
        )
                .map { it.copy(lastActiveChatBlockingId = event.source.id) }
                .flatMap { chatParticipationRepository.save(it) }
                .subscribe()
    }
}
