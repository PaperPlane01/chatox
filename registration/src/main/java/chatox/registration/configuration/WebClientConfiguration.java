package chatox.registration.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.reactive.function.client.ServerOAuth2AuthorizedClientExchangeFilterFunction;
import org.springframework.security.oauth2.client.web.server.ServerOAuth2AuthorizedClientRepository;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfiguration {
    @Value("${gateway.base.url}")
    private String gatewayBaseUrl;

    @Bean
    public WebClient webClient(ReactiveClientRegistrationRepository reactiveClientRegistrationRepository,
                               ServerOAuth2AuthorizedClientRepository serverOAuth2AuthorizedClientRepository) {
        var oauth = new ServerOAuth2AuthorizedClientExchangeFilterFunction(
                reactiveClientRegistrationRepository,
                serverOAuth2AuthorizedClientRepository
        );
        oauth.setDefaultOAuth2AuthorizedClient(true);
        oauth.setDefaultClientRegistrationId("registration-service");
        return WebClient.builder()
                .baseUrl(gatewayBaseUrl)
                .filter(oauth)
                .build();
    }
}
