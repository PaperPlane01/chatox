package chatox.chat.mongo.listener

import chatox.chat.model.Chat
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatRole
import chatox.chat.repository.ChatParticipationRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent
import org.springframework.stereotype.Component

@Component
class ChatMongoEventListener : AbstractMongoEventListener<Chat>() {
    @Autowired
    private lateinit var chatParticipationRepository: ChatParticipationRepository

    override fun onAfterSave(event: AfterSaveEvent<Chat>) {
        val chat = event.source;
        println(chat.createdAt == chat.updatedAt)
        println(chat.createdAt.equals(chat.updatedAt))
        println(chat.createdAt)
        println(chat.updatedAt)
        if (chat.createdAt == chat.updatedAt) {
            val chatParticipation = ChatParticipation(
                    user = chat.createdBy,
                    chat = chat,
                    role = ChatRole.ADMIN,
                    lastMessageRead = null
            )
            chatParticipationRepository.save(chatParticipation).subscribe()
        }
    }
}
