package chatox.registration.client;

import chatox.registration.api.request.CreateAccountRequest;
import chatox.registration.api.request.CreateAnonymousAccountRequest;
import chatox.registration.api.response.CreateAccountResponse;
import reactor.core.publisher.Mono;

public interface OAuthServiceClient {
    Mono<CreateAccountResponse> createAccount(CreateAccountRequest createAccountRequest);
    Mono<CreateAccountResponse> createAnonymousAccount(CreateAnonymousAccountRequest createAnonymousAccountRequest);
    Mono<Void> addUserToAccount(String accountId, String userId);
}
