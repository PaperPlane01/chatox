package chatox.oauth2.security.access;

import chatox.oauth2.api.request.CreateEmailConfirmationCodeRequest;
import chatox.oauth2.exception.EmailNotProvidedException;
import chatox.oauth2.security.AuthenticationFacade;
import chatox.oauth2.support.email.EmailPropertiesProvider;
import chatox.oauth2.support.email.EmailSourceStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EmailConfirmationCodePermissions {
    private final AuthenticationFacade authenticationFacade;
    private final EmailPropertiesProvider emailPropertiesProvider;

    public boolean canCreateEmailConfirmationCode(CreateEmailConfirmationCodeRequest sendVerificationEmailRequest) {
        var emailSourceStrategy = emailPropertiesProvider.getEmailSourceStrategy(sendVerificationEmailRequest.getType());

        if (emailSourceStrategy.equals(EmailSourceStrategy.USE_CURRENT_USER_EMAIL)) {
            return authenticationFacade.isUserAuthenticated()
                    && authenticationFacade.getCurrentUserDetails() != null
                    && authenticationFacade.getCurrentUserDetails().getEmail() != null;
        } else {
            if (sendVerificationEmailRequest.getEmail() == null) {
                throw new EmailNotProvidedException(
                        String.format(
                                "%s type of email verification requires \"email\" field to be present in request",
                                sendVerificationEmailRequest.getType()
                        )
                );
            }

            return true;
        }
    }
}
