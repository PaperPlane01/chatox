package chatox.registration.api.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EnhancedLoginWithGoogleRequest {
    private String googleAccessToken;
    private String clientId;
    private String clientSecret;
    private String accountId;
    private String userId;
}
