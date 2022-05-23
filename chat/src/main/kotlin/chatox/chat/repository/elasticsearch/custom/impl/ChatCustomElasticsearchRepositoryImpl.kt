package chatox.chat.repository.elasticsearch.custom.impl

import chatox.chat.model.User
import chatox.chat.model.elasticsearch.ChatElasticsearch
import chatox.chat.repository.elasticsearch.custom.ChatCustomElasticsearchRepository
import org.apache.lucene.search.join.ScoreMode
import org.elasticsearch.index.query.MultiMatchQueryBuilder
import org.elasticsearch.index.query.QueryBuilders
import org.springframework.data.elasticsearch.core.ReactiveElasticsearchTemplate
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
class ChatCustomElasticsearchRepositoryImpl(
        private val elasticsearchRestTemplate: ReactiveElasticsearchTemplate
) : ChatCustomElasticsearchRepository {

    override fun searchChatsOfUser(query: String, chatIds: List<String>, user: User): Flux<ChatElasticsearch> {
        val chatQuery = NativeSearchQueryBuilder()
                .withQuery(
                        QueryBuilders.multiMatchQuery(
                                query,
                                "name",
                                "slug"
                        )
                                .type(MultiMatchQueryBuilder.Type.PHRASE_PREFIX)
                )
                .build()
        val userQuery = NativeSearchQueryBuilder()
                .withQuery(QueryBuilders.nestedQuery(
                      "dialogDisplay",
                      QueryBuilders
                              .boolQuery()
                              .must(
                                      QueryBuilders.matchQuery("dialogDisplay.userId", user.id)
                              )
                              .must(
                                      QueryBuilders.multiMatchQuery(
                                              query,
                                              "dialogDisplay.otherParticipant.userDisplayedName",
                                              "dialogDisplay.otherParticipant.userSlug"
                                      )
                                              .type(MultiMatchQueryBuilder.Type.PHRASE_PREFIX)
                              ),
                        ScoreMode.None
                ))
                .build()
        val resultQuery = NativeSearchQueryBuilder()
                .withQuery(QueryBuilders.boolQuery()
                        .should(chatQuery.query)
                        .should(userQuery.query)
                )
                .withFilter(QueryBuilders.termsQuery("_id", chatIds))
                .build()

        return elasticsearchRestTemplate
                .search(resultQuery, ChatElasticsearch::class.java)
                .map { searchHit -> searchHit.content }
    }
}