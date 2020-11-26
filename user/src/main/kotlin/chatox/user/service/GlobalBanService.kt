package chatox.user.service

import chatox.user.api.request.BanUserRequest
import chatox.user.api.request.UpdateBanRequest
import chatox.user.api.response.GlobalBanResponse
import chatox.user.support.pagination.PaginationRequest
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface GlobalBanService {
    fun banUser(userId: String, banUserRequest: BanUserRequest): Mono<GlobalBanResponse>
    fun updateBan(userId: String, banId: String, updateBanRequest: UpdateBanRequest): Mono<GlobalBanResponse>
    fun cancelBan(userId: String, banId: String): Mono<GlobalBanResponse>
    fun findBans(excludeExpired: Boolean, excludeCanceled: Boolean, paginationRequest: PaginationRequest): Flux<GlobalBanResponse>
}
