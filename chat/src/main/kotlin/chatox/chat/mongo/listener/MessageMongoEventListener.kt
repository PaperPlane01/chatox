package chatox.chat.mongo.listener

import chatox.chat.mapper.MessageMapper
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.Message
import chatox.chat.repository.ChatRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent
import org.springframework.stereotype.Component

@Component
class MessageMongoEventListener : AbstractMongoEventListener<Message>() {
    @Autowired
    private lateinit var chatEventsPublisher: ChatEventsPublisher

    @Autowired
    private lateinit var messageMapper: MessageMapper

    @Autowired
    private lateinit var chatRepository: ChatRepository

    override fun onAfterSave(event: AfterSaveEvent<Message>) {
        val message = event.source

        if (!message.deleted) {
            if (message.updatedAt != null) {
                chatEventsPublisher.messageUpdated(messageMapper.toMessageResponse(
                        message = message,
                        mapReferredMessage = true,
                        readByCurrentUser = false
                ))
            } else {
                chatEventsPublisher.messageCreated(messageMapper.toMessageResponse(
                        message = message,
                        mapReferredMessage = true,
                        readByCurrentUser = false
                ))
                val chat = message.chat
                chat.lastMessage = message
                chat.lastMessageDate = message.createdAt
                chatRepository.save(chat).subscribe()
            }
        } else {
            chatEventsPublisher.messageDeleted(chatId = message.chat.id, messageId = message.id)
        }
    }
}
