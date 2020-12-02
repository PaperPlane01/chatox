package chatox.user.repository.custom

import chatox.user.api.request.GlobalBanFilters
import chatox.user.domain.GlobalBan
import org.springframework.data.domain.Pageable
import reactor.core.publisher.Flux

interface GlobalBanCustomRepository {
    fun searchGlobalBans(globalBanFilters: GlobalBanFilters, pageable: Pageable): Flux<GlobalBan>
}
