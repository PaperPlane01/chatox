package chatox.oauth2.service;

import chatox.oauth2.api.request.CreateConfirmationTokenRequest;
import chatox.oauth2.api.response.ConfirmationTokenResponse;

public interface ConfirmationTokenService {
    ConfirmationTokenResponse createConfirmationToken(CreateConfirmationTokenRequest createConfirmationTokenRequest);
}
