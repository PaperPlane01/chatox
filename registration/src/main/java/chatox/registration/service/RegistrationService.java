package chatox.registration.service;

import chatox.registration.api.request.AnonymousUserRegistrationRequest;
import chatox.registration.api.request.LoginWithGoogleRequest;
import chatox.registration.api.request.RegistrationRequest;
import chatox.registration.api.response.RegistrationResponse;
import reactor.core.publisher.Mono;

public interface RegistrationService {
    Mono<RegistrationResponse> registerUser(RegistrationRequest registrationRequest);
    Mono<RegistrationResponse> registerAnonymousUser(AnonymousUserRegistrationRequest anonymousUserRegistrationRequest);
    Mono<RegistrationResponse> loginWithGoogle(LoginWithGoogleRequest loginWithGoogleRequest);
}
