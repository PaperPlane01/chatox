package chatox.user.external

import chatox.user.api.response.BalanceResponse
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono

@Component
class BalanceApi(private val webClient: WebClient) {

    fun getBalanceOfUser(userId: String): Mono<BalanceResponse> {
        return webClient.get()
                .uri("/api/v1/balance?userId=${userId}")
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .toEntity(BalanceResponse::class.java)
                .mapNotNull { entity -> entity.body }
    }
}