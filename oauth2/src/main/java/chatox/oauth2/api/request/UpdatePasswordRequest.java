package chatox.oauth2.api.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdatePasswordRequest {
    @NotBlank
    private String password;
    @NotBlank
    private String repeatedPassword;
    private String emailConfirmationId;
    private String emailConfirmationVerificationCode;
}
