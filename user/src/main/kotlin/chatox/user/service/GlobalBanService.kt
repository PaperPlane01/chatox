package chatox.user.service

import chatox.platform.pagination.PaginationRequest
import chatox.user.api.request.BanMultipleUsersRequest
import chatox.user.api.request.BanUserRequest
import chatox.user.api.request.GlobalBanFilters
import chatox.user.api.request.UpdateBanRequest
import chatox.user.api.response.GlobalBanResponse
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface GlobalBanService {
    fun banUser(userId: String, banUserRequest: BanUserRequest): Mono<GlobalBanResponse>
    fun updateBan(userId: String, banId: String, updateBanRequest: UpdateBanRequest): Mono<GlobalBanResponse>
    fun cancelBan(userId: String, banId: String): Mono<GlobalBanResponse>
    fun findBans(filters: GlobalBanFilters, paginationRequest: PaginationRequest): Flux<GlobalBanResponse>
    fun banMultipleUsers(banMultipleUsersRequest: BanMultipleUsersRequest): Flux<GlobalBanResponse>
}
