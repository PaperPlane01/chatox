package chatox.registration.service.impl;

import chatox.registration.api.request.AnonymousUserRegistrationRequest;
import chatox.registration.api.request.CreateAccountRequest;
import chatox.registration.api.request.CreateAnonymousAccountRequest;
import chatox.registration.api.request.CreateUserRequest;
import chatox.registration.api.request.RegistrationRequest;
import chatox.registration.api.response.RegistrationResponse;
import chatox.registration.client.OAuthServiceClient;
import chatox.registration.client.UserServiceClient;
import chatox.registration.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {
    private final OAuthServiceClient oAuthServiceClient;
    private final UserServiceClient userServiceClient;

    @Override
    public Mono<RegistrationResponse> registerUser(RegistrationRequest registrationRequest) {
        var accountId = UUID.randomUUID().toString();
        var userId = UUID.randomUUID().toString();

        var createAccountRequest = CreateAccountRequest
                .builder()
                .id(accountId)
                .userId(userId)
                .password(registrationRequest.getPassword())
                .username(registrationRequest.getUsername())
                .clientId(registrationRequest.getClientId())
                .email(registrationRequest.getEmail())
                .emailConfirmationCodeId(registrationRequest.getEmailConfirmationCodeId())
                .emailConfirmationCode(registrationRequest.getEmailConfirmationCode())
                .build();

        var createUserRequest = CreateUserRequest
                .builder()
                .id(userId)
                .accountId(accountId)
                .firstName(registrationRequest.getFirstName())
                .lastName(registrationRequest.getLastName())
                .slug(registrationRequest.getSlug())
                .email(registrationRequest.getEmail())
                .anonymous(false)
                .build();

        return oAuthServiceClient.createAccount(createAccountRequest)
                .zipWith(userServiceClient.createUser(createUserRequest))
                .map(tuple -> RegistrationResponse.builder()
                        .userId(tuple.getT2().getId())
                        .firstName(tuple.getT2().getFirstName())
                        .lastName(tuple.getT2().getLastName())
                        .avatarUri(tuple.getT2().getAvatarUri())
                        .accessToken(tuple.getT1().getAccessToken())
                        .refreshToken(tuple.getT1().getRefreshToken())
                        .roles(tuple.getT1().getAccount().getRoles())
                        .username(tuple.getT1().getAccount().getUsername())
                        .slug(tuple.getT2().getSlug())
                        .accountId(tuple.getT1().getAccount().getId())
                        .anonymous(false)
                        .build()
                );
    }

    @Override
    public Mono<RegistrationResponse> registerAnonymousUser(AnonymousUserRegistrationRequest anonymousUserRegistrationRequest) {
        var accountId = UUID.randomUUID().toString();
        var userId = UUID.randomUUID().toString();

        var createAnonymousAccountRequest = CreateAnonymousAccountRequest.builder()
                .id(accountId)
                .clientId(anonymousUserRegistrationRequest.getClientId())
                .userId(userId)
                .build();

        var createUserRequest = CreateUserRequest.builder()
                .id(userId)
                .firstName(anonymousUserRegistrationRequest.getFirstName())
                .lastName(anonymousUserRegistrationRequest.getLastName())
                .accountId(accountId)
                .anonymous(true)
                .build();

        return oAuthServiceClient.createAnonymousAccount(createAnonymousAccountRequest)
                .zipWith(userServiceClient.createUser(createUserRequest))
                .map(tuple -> RegistrationResponse.builder()
                        .userId(tuple.getT2().getId())
                        .firstName(tuple.getT2().getFirstName())
                        .lastName(tuple.getT2().getLastName())
                        .accessToken(tuple.getT1().getAccessToken())
                        .refreshToken(tuple.getT1().getRefreshToken())
                        .roles(tuple.getT1().getAccount().getRoles())
                        .username(tuple.getT1().getAccount().getUsername())
                        .accountId(tuple.getT1().getAccount().getId())
                        .anonymous(false)
                        .build()
                );
    }
}
