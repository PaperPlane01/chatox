package chatox.chat.repository.elastisearch.custom.impl

import chatox.chat.model.Message
import chatox.chat.repository.elastisearch.custom.MessageCustomElasticsearchRepository
import org.springframework.data.domain.Pageable
import org.springframework.data.elasticsearch.core.ReactiveElasticsearchTemplate
import org.springframework.data.elasticsearch.core.query.Criteria
import org.springframework.data.elasticsearch.core.query.CriteriaQuery
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
class MessageElasticsearchCustomRepositoryImpl(
        private val elasticsearchRestTemplate: ReactiveElasticsearchTemplate
) : MessageCustomElasticsearchRepository {
    override fun findByTextAndChatId(text: String, chatId: String, pageable: Pageable): Flux<Message> {
        val criteria = Criteria("text").fuzzy(text)
                .and(Criteria("chatId").matches(chatId))
        val query = CriteriaQuery(criteria, pageable)

        return find(query)
    }

    override fun findByTextAndChatIdIn(text: String, chatIds: List<String>, pageable: Pageable): Flux<Message> {
        val criteria = Criteria("text").fuzzy(text)
                .and(Criteria("chatId").`in`(chatIds))
        val query = CriteriaQuery(criteria, pageable)

        return find(query)
    }

    private fun find(query: CriteriaQuery): Flux<Message> {
        return elasticsearchRestTemplate
                .search(query, Message::class.java)
                .map { searchHit -> searchHit.content }
    }
}