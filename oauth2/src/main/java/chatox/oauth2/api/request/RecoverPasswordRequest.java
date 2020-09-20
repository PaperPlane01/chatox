package chatox.oauth2.api.request;

import chatox.oauth2.support.validation.annotation.FieldsValueMatch;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldsValueMatch(
        field = "password",
        mustMatchField = "repeatedPassword",
        message = "password and repeatedPassword fields must be equal"
)
public class RecoverPasswordRequest {
    @NotBlank
    @Size(min = 4, max = 20)
    private String password;

    @NotBlank
    @Size(min = 4, max = 20)
    private String repeatedPassword;

    @NotBlank
    private String emailConfirmationCode;

    @NotBlank
    private String emailConfirmationCodeId;
}
