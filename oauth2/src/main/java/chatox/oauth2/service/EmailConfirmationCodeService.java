package chatox.oauth2.service;

import chatox.oauth2.api.request.CheckEmailConfirmationCodeValidityRequest;
import chatox.oauth2.api.request.CreateEmailConfirmationCodeRequest;
import chatox.oauth2.api.response.EmailAvailabilityResponse;
import chatox.oauth2.api.response.EmailConfirmationCodeValidityResponse;
import chatox.oauth2.api.response.EmailConfirmationCodeResponse;
import chatox.oauth2.domain.EmailConfirmationCode;

import javax.annotation.Nullable;

public interface EmailConfirmationCodeService {
    EmailConfirmationCodeResponse sendEmailConfirmationCode(CreateEmailConfirmationCodeRequest sendVerificationEmailRequest);
    EmailAvailabilityResponse checkEmailAvailability(String email);
    EmailConfirmationCodeValidityResponse checkEmailConfirmationCode(
            String emailConfirmationCodeId,
            CheckEmailConfirmationCodeValidityRequest checkEmailVerificationCodeValidityRequest);
    EmailConfirmationCodeValidityResponse checkEmailConfirmationCode(
            String emailConfirmationCodeId,
            CheckEmailConfirmationCodeValidityRequest checkEmailVerificationCodeValidityRequest,
            @Nullable String email);
    void assertEmailConfirmationCodeValid(String emailConfirmationCodeId, String emailConfirmationCode);
    void assertEmailConfirmationCodeValid(String emailConfirmationCodeId, String emailConfirmationCode, @Nullable String email);
    EmailConfirmationCode requireEmailConfirmationCode(String emailConfirmationCodeId, String emailConfirmationCodeValue);
    EmailConfirmationCode requireEmailConfirmationCode(String emailConfirmationCodeId, String emailConfirmationCodeValue, @Nullable String email);
}
