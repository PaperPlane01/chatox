package chatox.chat.mongo.listener

import chatox.chat.mapper.ChatParticipationMapper
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.ChatParticipation
import chatox.chat.repository.ChatRepository
import chatox.chat.util.getDifferenceInSeconds
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent
import org.springframework.stereotype.Component

@Component
class ChatParticipationMongoEventListener : AbstractMongoEventListener<ChatParticipation>() {
    @Autowired
    private lateinit var chatEventsPublisher: ChatEventsPublisher

    @Autowired
    private lateinit var chatParticipationMapper: ChatParticipationMapper

    @Autowired
    private lateinit var chatRepository: ChatRepository

    override fun onAfterSave(event: AfterSaveEvent<ChatParticipation>) {
        val chatParticipation = event.source

        // TODO
        // This is quite dirty hack because for some reason Spring sets @LastModifiedDate not equal
        // to @CreatedDate upon creation of document.
        // It would be probably better to set it manually, or set it to null upon creation.
        if (getDifferenceInSeconds(chatParticipation.createdAt!!, chatParticipation.lastModifiedAt!!) < 10) {
            chatEventsPublisher.userJoinedChat(chatParticipationMapper.toChatParticipationResponse(event.source))
            val chat = chatParticipation.chat
            chat.numberOfParticipants += 1
            chatRepository.save(chat).subscribe()
        }

    }
}
