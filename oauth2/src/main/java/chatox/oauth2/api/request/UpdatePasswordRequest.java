package chatox.oauth2.api.request;

import chatox.oauth2.support.validation.annotation.FieldsValueMatch;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldsValueMatch(
        field = "repeatedPassword",
        mustMatchField = "password",
        message = "password and repeatedPassword must be equal"
)
public class UpdatePasswordRequest {
    @NotBlank
    private String currentPassword;
    @NotBlank
    private String password;
    @NotBlank
    private String repeatedPassword;
    private String emailConfirmationCodeId;
    private String emailConfirmationCode;
}
