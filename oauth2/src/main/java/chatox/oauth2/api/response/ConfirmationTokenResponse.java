package chatox.oauth2.api.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ConfirmationTokenResponse {
    private String confirmationToken;
    private ZonedDateTime expiresAt;
}
