package chatox.oauth2.controller;

import chatox.oauth2.api.request.SendVerificationEmailRequest;
import chatox.oauth2.api.response.EmailVerificationResponse;
import chatox.oauth2.service.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
@RequestMapping("/oauth/email-verification")
@RequiredArgsConstructor
public class EmailVerificationController {
    private final EmailVerificationService emailVerificationService;

    @PostMapping
    public EmailVerificationResponse sendVerificationEmail(@RequestBody @Valid SendVerificationEmailRequest sendVerificationEmailRequest) {
        return emailVerificationService.sendVerificationEmail(sendVerificationEmailRequest);
    }
}
