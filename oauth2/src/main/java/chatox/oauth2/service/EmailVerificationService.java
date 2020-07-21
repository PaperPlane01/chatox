package chatox.oauth2.service;

import chatox.oauth2.api.request.CheckEmailVerificationCodeValidityRequest;
import chatox.oauth2.api.request.SendVerificationEmailRequest;
import chatox.oauth2.api.response.EmailAvailabilityResponse;
import chatox.oauth2.api.response.EmailVerificationCodeValidityResponse;
import chatox.oauth2.api.response.EmailVerificationResponse;

public interface EmailVerificationService {
    EmailVerificationResponse sendVerificationEmail(SendVerificationEmailRequest sendVerificationEmailRequest);
    EmailAvailabilityResponse checkEmailAvailability(String email);
    EmailVerificationCodeValidityResponse checkEmailVerificationCode(String emailVerificationId, CheckEmailVerificationCodeValidityRequest checkEmailVerificationCodeValidityRequest);
}
