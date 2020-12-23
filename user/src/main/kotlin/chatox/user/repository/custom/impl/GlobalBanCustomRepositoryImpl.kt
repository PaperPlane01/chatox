package chatox.user.repository.custom.impl

import chatox.platform.time.TimeService
import chatox.user.api.request.GlobalBanFilters
import chatox.user.domain.GlobalBan
import chatox.user.domain.User
import chatox.user.repository.custom.GlobalBanCustomRepository
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
class GlobalBanCustomRepositoryImpl(private val mongoTemplate: ReactiveMongoTemplate,
                                    private val timeService: TimeService) : GlobalBanCustomRepository {
    override fun searchGlobalBans(globalBanFilters: GlobalBanFilters, pageable: Pageable): Flux<GlobalBan> {
        val query = Query().with(pageable)

        if (globalBanFilters.excludeCanceled) {
            query.addCriteria(Criteria.where("canceled").`is`(false))
        }

        if (globalBanFilters.excludeExpired) {
            val now = timeService.now()
            val criteria = Criteria().orOperator(
                    Criteria.where("permanent").`is`(true),
                    Criteria.where("expiresAt").gt(now)
            )
            query.addCriteria(criteria)
        }

        if (globalBanFilters.bannedUserId != null) {
            query.addCriteria(Criteria.where("bannedUser._id").`is`(globalBanFilters.bannedUserId))
        }

        if (globalBanFilters.bannedById != null) {
            query.addCriteria(Criteria.where("createdBy._id").`is`(globalBanFilters.bannedById))
        }

        return mongoTemplate.find(query, GlobalBan::class.java)
    }

    override fun findActiveByBannedUser(user: User): Flux<GlobalBan> {
        val now = timeService.now()
        val query = Query()
                .addCriteria(Criteria.where("bannedUser._id").`is`(user.id))
                .addCriteria(
                        Criteria().andOperator(
                                Criteria.where("canceled").`is`(false),
                                Criteria().orOperator(
                                        Criteria.where("permanent").`is`(true),
                                        Criteria.where("expiresAt").gt(now)
                                )
                        )
                )

        return mongoTemplate.find(query, GlobalBan::class.java)
    }
}
