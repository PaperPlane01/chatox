package chatox.registration.api.request;

import chatox.registration.support.validation.annotation.FieldsValueMatch;
import chatox.registration.support.validation.annotation.NotNullIfFieldPresent;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldsValueMatch(
        field = "password",
        mustMatchField = "repeatedPassword",
        message = "password and repeatedPassword fields must be equal"
)
@NotNullIfFieldPresent(
        field = "email",
        validatedFields = {
                "emailConfirmationCodeId",
                "emailConfirmationCode"
        },
        acceptEmpty = false,
        message = "emailConfirmationCodeId and emailConfirmationCode parameters must be supplied along with email"
)
public class RegistrationRequest {
    @NotBlank
    @Size(min = 4, max = 20)
    private String username;

    @NotBlank
    @Size(min = 2, max = 20)
    private String firstName;

    @Size(min = 2, max = 20)
    private String lastName;

    @NotBlank
    @Size(min = 5, max = 40)
    private String password;

    @NotBlank
    @Size(min = 5, max = 50)
    private String repeatedPassword;

    @Size(min = 3, max = 30)
    @Pattern(regexp = "^[a-zA-Z0-9_.]+$")
    private String slug;

    @NotBlank
    private String clientId;

    @Email
    private String email;

    private String emailConfirmationCodeId;
    private String emailConfirmationCode;
}
