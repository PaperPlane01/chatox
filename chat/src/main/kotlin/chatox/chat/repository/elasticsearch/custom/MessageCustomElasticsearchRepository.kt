package chatox.chat.repository.elasticsearch.custom

import chatox.chat.model.elasticsearch.MessageElasticsearch
import org.springframework.data.domain.Pageable
import reactor.core.publisher.Flux

interface MessageCustomElasticsearchRepository {
    fun findByTextAndChatId(text: String, chatId: String, pageable: Pageable): Flux<MessageElasticsearch>
    fun findByTextAndChatIdIn(text: String, chatIds: List<String>, pageable: Pageable): Flux<MessageElasticsearch>
}