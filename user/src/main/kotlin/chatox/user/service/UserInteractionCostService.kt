package chatox.user.service

import chatox.user.api.request.UserInteractionCostRequest
import chatox.user.api.response.UserInteractionCostFullResponse
import chatox.user.api.response.UserInteractionCostResponse
import chatox.user.domain.UserInteractionType
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.math.BigDecimal

interface UserInteractionCostService {
    fun getUserInteractionCosts(): Flux<UserInteractionCostResponse>
    fun getFullUserInteractionCosts(): Flux<UserInteractionCostFullResponse>
    fun getUserInteractionCost(type: UserInteractionType): Mono<BigDecimal>
    fun creatOrUpdateUserInteractionCost(userInteractionCostRequest: UserInteractionCostRequest): Mono<UserInteractionCostFullResponse>
}