package chatox.oauth2.controller;

import chatox.oauth2.api.request.CreateConfirmationTokenRequest;
import chatox.oauth2.api.response.ConfirmationTokenResponse;
import chatox.oauth2.service.ConfirmationTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ConfirmationTokenController {
    private final ConfirmationTokenService confirmationTokenService;

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/oauth2/token/confirmation")
    public ConfirmationTokenResponse createConfirmationToken(@RequestBody @Valid CreateConfirmationTokenRequest createConfirmationTokenRequest) {
        return confirmationTokenService.createConfirmationToken(createConfirmationTokenRequest);
    }
}
