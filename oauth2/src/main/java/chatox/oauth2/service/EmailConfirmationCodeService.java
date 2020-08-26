package chatox.oauth2.service;

import chatox.oauth2.api.request.CheckEmailConfirmationCodeValidityRequest;
import chatox.oauth2.api.request.CreateEmailConfirmationCodeRequest;
import chatox.oauth2.api.response.EmailAvailabilityResponse;
import chatox.oauth2.api.response.EmailConfirmationCodeValidityResponse;
import chatox.oauth2.api.response.EmailConfirmationCodeResponse;

public interface EmailConfirmationCodeService {
    EmailConfirmationCodeResponse sendVerificationEmail(CreateEmailConfirmationCodeRequest sendVerificationEmailRequest);
    EmailAvailabilityResponse checkEmailAvailability(String email);
    EmailConfirmationCodeValidityResponse checkEmailVerificationCode(String emailVerificationId, CheckEmailConfirmationCodeValidityRequest checkEmailVerificationCodeValidityRequest);
}
