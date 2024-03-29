package chatox.registration.api.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RegistrationResponse {
    private String userId;
    private List<String> roles;
    private String accessToken;
    private String refreshToken;
    private String username;
    private String firstName;
    private String lastName;
    private String slug;
    private String externalAvatarUri;
    private String accountId;
    private ZonedDateTime createdAt;
    private boolean anonymous;
}
