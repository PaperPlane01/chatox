package chatox.chat.repository.elasticsearch.custom.impl

import chatox.chat.model.User
import chatox.chat.model.elasticsearch.ChatElasticsearch
import chatox.chat.repository.elasticsearch.custom.ChatCustomElasticsearchRepository
import co.elastic.clients.elasticsearch._types.FieldValue
import co.elastic.clients.elasticsearch._types.query_dsl.ChildScoreMode
import co.elastic.clients.elasticsearch._types.query_dsl.QueryBuilders
import org.springframework.data.elasticsearch.client.elc.NativeQuery
import org.springframework.data.elasticsearch.client.elc.ReactiveElasticsearchTemplate
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
class ChatCustomElasticsearchRepositoryImpl(
        private val elasticsearchRestTemplate: ReactiveElasticsearchTemplate
) : ChatCustomElasticsearchRepository {

    override fun searchChatsOfUser(query: String, chatIds: List<String>, user: User): Flux<ChatElasticsearch> {
        val chatQuery = NativeQuery.builder().withQuery(
                QueryBuilders.multiMatch()
                        .fields("name", "slug")
                        .query(query)
                        .build()
                        ._toQuery()
        )
        val userQuery = NativeQuery.builder().withQuery(
                QueryBuilders.nested()
                        .path("dialogDisplay")
                        .query(
                                QueryBuilders.bool()
                                        .must(
                                                QueryBuilders.match()
                                                        .field("dialogDisplay.userId")
                                                        .query(user.id)
                                                        .build()
                                                        ._toQuery()
                                        )
                                        .must(QueryBuilders.multiMatch()
                                                .fields(
                                                        "dialogDisplay.otherParticipant.userDisplayedName",
                                                        "dialogDisplay.otherParticipant.userSlug"
                                                )
                                                .query(query)
                                                .build()
                                                ._toQuery()
                                        )
                                        .build()
                                        ._toQuery()
                        )
                        .scoreMode(ChildScoreMode.None)
                        .build()
                        ._toQuery()
        )
        val resultQuery = NativeQuery.builder()
                .withQuery(
                        QueryBuilders.bool()
                                .should(chatQuery.query)
                                .should(userQuery.query)
                                .build()
                                ._toQuery()
                )
                .withFilter(QueryBuilders.terms()
                        .field("_id")
                        .terms { terms -> terms.value(chatIds.map { FieldValue.of(it) }) }
                        .build()
                        ._toQuery()
                )
                .build()

        return elasticsearchRestTemplate
                .search(resultQuery, ChatElasticsearch::class.java)
                .map { searchHit -> searchHit.content }
    }
}