package chatox.oauth2.service;

import chatox.oauth2.api.request.LoginWithGoogleRequest;
import chatox.oauth2.api.response.LoginWithGoogleResponse;

public interface GoogleRegistrationService {
    LoginWithGoogleResponse loginWithGoogle(LoginWithGoogleRequest loginWithGoogleRequest);
}
