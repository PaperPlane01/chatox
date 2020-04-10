package chatox.chat.mongo.listener

import chatox.chat.model.ChatBlocking
import chatox.chat.repository.ChatParticipationRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent
import org.springframework.stereotype.Component

@Component
class ChatBlockingMongoEventListener : AbstractMongoEventListener<ChatBlocking>() {
    @Autowired
    private lateinit var chatParticipationRepository: ChatParticipationRepository

    override fun onAfterSave(event: AfterSaveEvent<ChatBlocking>) {
        chatParticipationRepository.findByChatAndUser(
                chat = event.source.chat,
                user = event.source.blockedUser
        )
                .map { it.copy(lastChatBlocking = event.source) }
                .flatMap { chatParticipationRepository.save(it) }
                .subscribe()
    }
}
