package chatox.registration.client.impl;

import chatox.registration.api.request.CreateAccountRequest;
import chatox.registration.api.request.CreateAnonymousAccountRequest;
import chatox.registration.api.request.EnhancedLoginWithGoogleRequest;
import chatox.registration.api.response.CreateAccountResponse;
import chatox.registration.api.response.LoginWithGoogleResponse;
import chatox.registration.client.OAuthServiceClient;
import chatox.registration.exception.AccountRegistrationException;
import chatox.registration.exception.EmailAlreadyTakenException;
import chatox.registration.exception.EmailMismatchException;
import chatox.registration.exception.EmailVerificationExpiredException;
import chatox.registration.exception.EmailVerificationNotFoundException;
import chatox.registration.exception.InvalidEmailVerificationCodeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuthServiceClientImpl implements OAuthServiceClient {
    private final WebClient webClient;

    @Override
    public Mono<CreateAccountResponse> createAccount(CreateAccountRequest createAccountRequest) {
        return webClient.post()
                .uri("/oauth/accounts")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Mono.just(createAccountRequest), CreateAccountRequest.class)
                .retrieve()
                .onStatus(HttpStatusCode::isError, this::handleRegistrationError)
                .toEntity(CreateAccountResponse.class)
                .mapNotNull(HttpEntity::getBody);
    }

    @Override
    public Mono<CreateAccountResponse> createAnonymousAccount(CreateAnonymousAccountRequest createAnonymousAccountRequest) {
        return webClient.post()
                .uri("/oauth/accounts/anonymous")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Mono.just(createAnonymousAccountRequest), CreateAnonymousAccountRequest.class)
                .retrieve()
                .onStatus(HttpStatusCode::isError, this::handleRegistrationError)
                .toEntity(CreateAccountResponse.class)
                .mapNotNull(HttpEntity::getBody);
    }

    private Mono<Throwable> handleRegistrationError(ClientResponse clientResponse) {
        Throwable error;

        switch (HttpStatus.valueOf(clientResponse.statusCode().value())) {
            case BAD_REQUEST -> error = new InvalidEmailVerificationCodeException("Provided email verification code is invalid");
            case FORBIDDEN -> error = new EmailMismatchException(
                    "Email provided in request does not match with email in email verification with the specified id"
            );
            case NOT_FOUND -> error = new EmailVerificationNotFoundException("Email verification with the specified ID was not found");
            case CONFLICT -> error = new EmailAlreadyTakenException("This email has already been taken");
            case GONE -> error = new EmailVerificationExpiredException("This email verification code expired");
            default -> {
                log.error("Unexpected error occurred upon account registration," +
                        " oauth2 service responded with {} status", clientResponse.statusCode().value());
                error = new AccountRegistrationException("Unexpected error occurred upon account registration");
            }
        }

        return Mono.just(error);
    }

    @Override
    public Mono<Void> addUserToAccount(String accountId, String userId) {
        return webClient.put()
                .uri("/oauth/accounts/" + accountId + "/users/" + userId)
                .retrieve()
                .bodyToMono(Void.class);
    }

    @Override
    public Mono<LoginWithGoogleResponse> loginWithGoogle(EnhancedLoginWithGoogleRequest loginWithGoogleRequest) {
        return webClient.post()
                .uri("/oauth/accounts/google")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Mono.just(loginWithGoogleRequest), EnhancedLoginWithGoogleRequest.class)
                .retrieve()
                .onStatus(HttpStatusCode::isError, this::handleGoogleRegistrationError)
                .toEntity(LoginWithGoogleResponse.class)
                .mapNotNull(HttpEntity::getBody);
    }

    private Mono<Throwable> handleGoogleRegistrationError(ClientResponse clientResponse) {
        log.error("Unexpected error occurred upon registration with google account," +
                " oauth2 service responded with {} status", clientResponse.statusCode().value());
        return Mono.just(
                new AccountRegistrationException("Unexpected error occurred upon registration with google account")
        );
    }
}
