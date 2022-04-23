package chatox.chat.repository.elastisearch.custom

import chatox.chat.model.Message
import org.springframework.data.domain.Pageable
import reactor.core.publisher.Flux

interface MessageCustomElasticsearchRepository {
    fun findByTextAndChatId(text: String, chatId: String, pageable: Pageable): Flux<Message>
    fun findByTextAndChatIdIn(text: String, chatIds: List<String>, pageable: Pageable): Flux<Message>
}