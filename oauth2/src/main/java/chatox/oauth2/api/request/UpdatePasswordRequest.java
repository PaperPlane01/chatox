package chatox.oauth2.api.request;

import chatox.oauth2.support.validation.annotation.FieldsValueMatch;
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
@FieldsValueMatch(
        field = "repeatedPassword",
        mustMatchField = "password",
        message = "password and repeatedPassword must be equal"
)
public class UpdatePasswordRequest {
    @NotBlank
    private String currentPassword;

    @NotBlank
    @Size(min = 4, max = 20)
    private String password;

    @NotBlank
    @Size(min = 4, max = 20)
    private String repeatedPassword;
    private String emailConfirmationCodeId;
    private String emailConfirmationCode;
}
