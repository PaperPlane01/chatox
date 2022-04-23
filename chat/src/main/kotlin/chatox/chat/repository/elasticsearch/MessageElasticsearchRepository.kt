package chatox.chat.repository.elastisearch

import chatox.chat.model.Message
import chatox.chat.repository.elastisearch.custom.MessageCustomElasticsearchRepository
import org.springframework.data.repository.reactive.ReactiveCrudRepository

interface MessageElasticsearchRepository : ReactiveCrudRepository<Message, String>, MessageCustomElasticsearchRepository {
}