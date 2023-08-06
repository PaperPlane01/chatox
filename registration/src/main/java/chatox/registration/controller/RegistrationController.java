package chatox.registration.controller;

import chatox.registration.api.request.AnonymousUserRegistrationRequest;
import chatox.registration.api.request.LoginWithGoogleRequest;
import chatox.registration.api.request.RegistrationRequest;
import chatox.registration.api.response.RegistrationResponse;
import chatox.registration.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/registration")
@RequiredArgsConstructor
public class RegistrationController {
    private final RegistrationService registrationService;

    @PostMapping
    public Mono<RegistrationResponse> registerUser(@RequestBody @Valid RegistrationRequest registrationRequest) {
        return registrationService.registerUser(registrationRequest);
    }

    @PostMapping("/anonymous")
    public Mono<RegistrationResponse> registerAnonymousUser(@RequestBody @Valid AnonymousUserRegistrationRequest anonymousUserRegistrationRequest) {
        return registrationService.registerAnonymousUser(anonymousUserRegistrationRequest);
    }

    @PostMapping("/google")
    public Mono<RegistrationResponse> loginWithGoogle(@RequestBody @Valid LoginWithGoogleRequest loginWithGoogleRequest) {
        return registrationService.loginWithGoogle(loginWithGoogleRequest);
    }
}
