package chatox.chat.mongo.listener

import chatox.chat.model.Message
import chatox.chat.repository.elasticsearch.MessageElasticsearchRepository
import chatox.platform.cache.ReactiveCacheService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent
import org.springframework.stereotype.Component

@Component
class MessageMongoEventListener : AbstractMongoEventListener<Message>() {
    @Autowired
    private lateinit var messageCacheService: ReactiveCacheService<Message, String>

    @Autowired
    private lateinit var messageElasticsearchRepository: MessageElasticsearchRepository

    override fun onAfterSave(event: AfterSaveEvent<Message>) {
        val message = event.source
        messageCacheService.put(message).subscribe()
        messageElasticsearchRepository.save(message.toElasticsearch()).subscribe()
    }
}
