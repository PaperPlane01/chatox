package chatox.registration.client.impl;

import chatox.registration.api.request.CreateAccountRequest;
import chatox.registration.api.request.CreateAnonymousAccountRequest;
import chatox.registration.api.response.CreateAccountResponse;
import chatox.registration.client.OAuthServiceClient;
import chatox.registration.exception.AccountRegistrationException;
import chatox.registration.exception.EmailAlreadyTakenException;
import chatox.registration.exception.EmailMismatchException;
import chatox.registration.exception.EmailVerificationExpiredException;
import chatox.registration.exception.EmailVerificationNotFoundException;
import chatox.registration.exception.InvalidEmailVerificationCodeException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class OAuthServiceClientImpl implements OAuthServiceClient {
    private final WebClient webClient;

    @Override
    public Mono<CreateAccountResponse> createAccount(CreateAccountRequest createAccountRequest) {
        return webClient.post()
                .uri("/oauth/accounts")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Mono.just(createAccountRequest), CreateAccountRequest.class)
                .exchange()
                .doOnNext(this::handleRegistrationErrorIfPresent)
                .flatMap(clientResponse -> clientResponse.bodyToMono(CreateAccountResponse.class));
    }

    @Override
    public Mono<CreateAccountResponse> createAnonymousAccount(CreateAnonymousAccountRequest createAnonymousAccountRequest) {
        return webClient.post()
                .uri("/oauth/accounts/anonymous")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Mono.just(createAnonymousAccountRequest), CreateAnonymousAccountRequest.class)
                .exchange()
                .doOnNext(this::handleRegistrationErrorIfPresent)
                .flatMap(clientResponse -> clientResponse.bodyToMono(CreateAccountResponse.class));
    }

    private void handleRegistrationErrorIfPresent(ClientResponse clientResponse) {
        if (clientResponse.statusCode().is4xxClientError()) {
            switch (clientResponse.statusCode()) {
                case BAD_REQUEST:
                    throw new InvalidEmailVerificationCodeException("Provided email verification code is invalid");
                case FORBIDDEN:
                    throw new EmailMismatchException(
                            "Email provided in request does not match with email in email verification with the specified id"
                    );
                case NOT_FOUND:
                    throw new EmailVerificationNotFoundException("Email verification with the specified ID was not found");
                case CONFLICT:
                    throw new EmailAlreadyTakenException("This email has already been taken");
                case GONE:
                    throw new EmailVerificationExpiredException("This email verification code expired");
                default:
                    throw new AccountRegistrationException("Unexpected error occurred upon account registration");
            }
        }

        if (clientResponse.statusCode().is5xxServerError()) {
            throw new AccountRegistrationException("Unexpected error occurred upon account registration");
        }
    }

    @Override
    public Mono<Void> addUserToAccount(String accountId, String userId) {
        return webClient.put()
                .uri("/oauth/accounts/" + accountId + "/users/" + userId)
                .retrieve()
                .bodyToMono(Void.class);
    }
}
