package chatox.registration.api.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

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
