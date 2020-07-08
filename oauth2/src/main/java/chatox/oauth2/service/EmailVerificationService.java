package chatox.oauth2.service;

import chatox.oauth2.api.request.SendVerificationEmailRequest;
import chatox.oauth2.api.response.EmailVerificationResponse;

public interface EmailVerificationService {
    EmailVerificationResponse sendVerificationEmail(SendVerificationEmailRequest sendVerificationEmailRequest);
}
