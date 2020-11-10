package chatox.oauth2.api.request;

import chatox.oauth2.support.validation.annotation.NotNullIfFieldPresent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@NotNullIfFieldPresent(
        field = "email",
        validatedFields = {
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
