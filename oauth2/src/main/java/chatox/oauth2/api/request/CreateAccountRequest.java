package chatox.oauth2.api.request;

import chatox.oauth2.support.validation.annotation.NotNullIfFieldPresent;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@NotNullIfFieldPresent(
        field = "email",
        checkedFields = {
                "emailConfirmationCodeId",
                "emailConfirmationCode"
        },
        acceptEmpty = false,
        message = "emailConfirmationCodeId and emailConfirmationCode must be supplied along with email"
)
public class CreateAccountRequest {
    @NotBlank
    private String id;

    @NotBlank
    private String userId;

    @NotBlank
    private String username;

    @NotBlank
    @Size(min = 4, max = 20)
    private String password;

    @NotBlank
    private String clientId;

    @Email
    private String email;
    private String emailConfirmationCodeId;
    private String emailConfirmationCode;
}
