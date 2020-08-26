package chatox.registration.api.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RegistrationRequest {
    @NotBlank(message = "Username must be present")
    private String username;

    @NotBlank(message = "First name must be present")
    private String firstName;
    private String lastName;

    @NotBlank(message = "Password must be present")
    private String password;

    @NotBlank(message = "Repeated password must be present")
    private String repeatedPassword;
    private String slug;

    @NotBlank(message = "Client id must be specified")
    private String clientId;

    @Email(message = "Email must be a valid email")
    private String email;

    private String emailConfirmationCodeId;
    private String emailConfirmationCode;
}
