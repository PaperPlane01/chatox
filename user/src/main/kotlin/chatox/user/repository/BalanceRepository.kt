package chatox.user.repository

import chatox.user.domain.Balance
import chatox.user.domain.Currency
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Mono

interface BalanceRepository : ReactiveMongoRepository<Balance, String> {
    fun findByUserIdAndCurrency(userId: String, currency: Currency): Mono<Balance>
}