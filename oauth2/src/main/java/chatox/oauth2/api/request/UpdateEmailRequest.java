package chatox.oauth2.api.request;

import chatox.oauth2.support.validation.annotation.NotNullIfFieldPresent;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@NotNullIfFieldPresent(
        field = "oldEmail",
        checkedFields = {"changeEmailConfirmationCodeId", "changeEmailConfirmationCode"},
        message = "changeEmailConfirmationCodeId and changeEmailConfirmationCode must be supplied along with oldEmail"
)
public class UpdateEmailRequest {
    @Email
    private String oldEmail;
    private String changeEmailConfirmationCodeId;
    private String changeEmailConfirmationCode;

    @Email
    private String newEmail;

    @NotBlank
    private String newEmailConfirmationCodeId;

    @NotBlank
    private String newEmailConfirmationCode;
}
