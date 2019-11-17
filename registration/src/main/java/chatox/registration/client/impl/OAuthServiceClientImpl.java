package chatox.registration.client.impl;

import chatox.registration.api.request.CreateAccountRequest;
import chatox.registration.api.response.CreateAccountResponse;
import chatox.registration.client.OAuthServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class OAuthServiceClientImpl implements OAuthServiceClient {
    private final WebClient webClient;

    @Override
    public Mono<CreateAccountResponse> createAccount(CreateAccountRequest createAccountRequest) {
        return webClient.post()
                .uri("/oauth/account")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Mono.just(createAccountRequest), CreateAccountRequest.class)
                .retrieve()
                .bodyToMono(CreateAccountResponse.class);
    }

    @Override
    public Mono<Void> addUserToAccount(String accountId, String userId) {
        return webClient.put()
                .uri("/oauth/accounts/" + accountId + "/users/" + userId)
                .retrieve()
                .bodyToMono(Void.class);
    }
}
