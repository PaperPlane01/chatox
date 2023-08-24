package chatox.user.service

import chatox.user.domain.Balance
import chatox.user.domain.Currency
import chatox.user.messaging.rabbitmq.event.BalanceUpdated
import reactor.core.publisher.Mono

interface BalanceService {
    fun handleBalanceUpdate(balanceUpdated: BalanceUpdated): Mono<Unit>
    fun getBalanceOfCurrentUser(currency: Currency): Mono<Balance>
}