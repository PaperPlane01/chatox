package chatox.user.config

import chatox.platform.gateway.ChatoxGatewayConfigProperties
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository
import org.springframework.security.oauth2.client.web.reactive.function.client.ServerOAuth2AuthorizedClientExchangeFilterFunction
import org.springframework.security.oauth2.client.web.server.ServerOAuth2AuthorizedClientRepository
import org.springframework.web.reactive.function.client.WebClient

@Configuration
class WebClientConfig {
    @Autowired
    private lateinit var gatewayConfig: ChatoxGatewayConfigProperties

    @Bean
    fun webClient(reactiveClientRegistrationRepository: ReactiveClientRegistrationRepository?,
                  serverOAuth2AuthorizedClientRepository: ServerOAuth2AuthorizedClientRepository?): WebClient {
        val oauth = ServerOAuth2AuthorizedClientExchangeFilterFunction(
                reactiveClientRegistrationRepository,
                serverOAuth2AuthorizedClientRepository
        )
        oauth.setDefaultOAuth2AuthorizedClient(true)
        oauth.setDefaultClientRegistrationId("user-service")
        return WebClient.builder()
                .baseUrl(gatewayConfig.url)
                .filter(oauth)
                .build()
    }
}