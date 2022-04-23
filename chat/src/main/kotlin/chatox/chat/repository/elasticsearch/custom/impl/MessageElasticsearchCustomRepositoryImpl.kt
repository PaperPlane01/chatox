package chatox.chat.repository.elasticsearch.custom.impl

import chatox.chat.model.elasticsearch.MessageElasticsearch
import chatox.chat.repository.elasticsearch.custom.MessageCustomElasticsearchRepository
import org.elasticsearch.common.unit.Fuzziness
import org.elasticsearch.index.query.QueryBuilder
import org.elasticsearch.index.query.QueryBuilders
import org.springframework.data.domain.Pageable
import org.springframework.data.elasticsearch.core.ReactiveElasticsearchTemplate
import org.springframework.data.elasticsearch.core.query.Criteria
import org.springframework.data.elasticsearch.core.query.CriteriaQuery
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder
import org.springframework.data.elasticsearch.core.query.Query
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
class MessageElasticsearchCustomRepositoryImpl(
        private val elasticsearchRestTemplate: ReactiveElasticsearchTemplate
) : MessageCustomElasticsearchRepository {
    override fun findByTextAndChatId(text: String, chatId: String, pageable: Pageable): Flux<MessageElasticsearch> {
        val query = NativeSearchQueryBuilder()
                .withQuery(QueryBuilders.matchPhrasePrefixQuery("text", text).slop(2))
                .withFilter(QueryBuilders.matchQuery("chatId", chatId))
                .withPageable(pageable)
                .build();

        return find(query)
    }

    override fun findByTextAndChatIdIn(text: String, chatIds: List<String>, pageable: Pageable): Flux<MessageElasticsearch> {
        val criteria = Criteria("text").fuzzy(text)
                .and(Criteria("chatId").`in`(chatIds))
        val query = CriteriaQuery(criteria, pageable)

        return find(query)
    }

    private fun find(query: Query): Flux<MessageElasticsearch> {
        return elasticsearchRestTemplate
                .search(query, MessageElasticsearch::class.java)
                .map { searchHit -> searchHit.content }
    }
}