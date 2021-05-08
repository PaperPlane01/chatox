package chatox.oauth2.api.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginWithGoogleResponse {
    private AccountResponse account;
    private String accessToken;
    private String refreshToken;
    private boolean newAccountCreated;
    private ExternalAccountDetailsResponse externalAccountDetails;
    private String userId;
}
