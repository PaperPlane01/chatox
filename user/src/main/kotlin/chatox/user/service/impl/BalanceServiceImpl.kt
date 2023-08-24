package chatox.user.service.impl

import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.user.domain.Balance
import chatox.user.domain.Currency
import chatox.user.domain.User
import chatox.user.external.BalanceApi
import chatox.user.messaging.rabbitmq.event.BalanceUpdated
import chatox.user.repository.BalanceRepository
import chatox.user.service.BalanceService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.bson.types.ObjectId
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class BalanceServiceImpl(
        private val balanceRepository: BalanceRepository,
        private val balanceApi: BalanceApi,
        private val authenticationHolder: ReactiveAuthenticationHolder<User>) : BalanceService {

    override fun handleBalanceUpdate(balanceUpdated: BalanceUpdated): Mono<Unit> {
        return mono {
            val existingBalance = balanceRepository.findByUserIdAndCurrency(
                    userId = balanceUpdated.userId,
                    currency = balanceUpdated.currency
            )
                    .awaitFirstOrNull()

            if (existingBalance != null) {
                balanceRepository.save(existingBalance.copy(amount = balanceUpdated.amount)).awaitFirst()
            } else {
                val balance = Balance(
                        id = ObjectId().toHexString(),
                        amount = balanceUpdated.amount,
                        currency = balanceUpdated.currency,
                        userId = balanceUpdated.userId
                )
                balanceRepository.save(balance).awaitFirst()
            }

            return@mono
        }
    }

    override fun getBalanceOfCurrentUser(currency: Currency): Mono<Balance> {
        return mono {
            val currentUserId = authenticationHolder.requireCurrentUserDetails().awaitFirst().id
            val existingBalance = balanceRepository.findByUserIdAndCurrency(
                    userId = currentUserId,
                    currency = currency
            )
                    .awaitFirstOrNull()

            if (existingBalance != null) {
                return@mono existingBalance
            } else {
                val externalBalance = balanceApi.getBalanceOfUser(currentUserId).awaitFirst()

                val balance = Balance(
                        id = ObjectId().toHexString(),
                        amount = externalBalance.amount,
                        currency = externalBalance.currency,
                        userId = currentUserId
                )

                balanceRepository.save(balance).awaitFirst()

                return@mono balance
            }
        }
    }
}