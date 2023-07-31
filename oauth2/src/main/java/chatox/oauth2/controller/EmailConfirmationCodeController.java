package chatox.oauth2.controller;

import chatox.oauth2.api.request.CheckEmailConfirmationCodeValidityRequest;
import chatox.oauth2.api.request.CreateEmailConfirmationCodeRequest;
import chatox.oauth2.api.response.EmailConfirmationCodeValidityResponse;
import chatox.oauth2.api.response.EmailConfirmationCodeResponse;
import chatox.oauth2.service.EmailConfirmationCodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/oauth/emailConfirmationCodes")
@RequiredArgsConstructor
public class EmailConfirmationCodeController {
    private final EmailConfirmationCodeService emailConfirmationCodeService;

    @PreAuthorize("@emailConfirmationCodePermissions.canCreateEmailConfirmationCode(#createEmailConfirmationCodeRequest)")
    @PostMapping
    public EmailConfirmationCodeResponse sendVerificationEmail(
            @RequestBody @Valid CreateEmailConfirmationCodeRequest createEmailConfirmationCodeRequest
    ) {
        return emailConfirmationCodeService.sendEmailConfirmationCode(createEmailConfirmationCodeRequest);
    }

    @PostMapping("/{id}/isValid")
    public EmailConfirmationCodeValidityResponse checkEmailConfirmationCOde(
            @PathVariable String id,
            @RequestBody @Valid CheckEmailConfirmationCodeValidityRequest checkEmailConfirmationCodeValidityRequest
    ) {
        return emailConfirmationCodeService.checkEmailConfirmationCode(id, checkEmailConfirmationCodeValidityRequest);
    }
}
