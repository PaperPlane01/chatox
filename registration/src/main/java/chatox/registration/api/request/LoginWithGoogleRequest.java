package chatox.registration.api.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginWithGoogleRequest {
    @NotBlank
    private String googleAccessToken;

    @NotBlank
    private String clientId;

    @NotBlank
    private String clientSecret;
}
