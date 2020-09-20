package chatox.oauth2.api.request;

import chatox.oauth2.domain.EmailConfirmationCodeType;
import chatox.oauth2.domain.Language;
import chatox.oauth2.support.validation.annotation.FieldMustBeNotNullIfEmailConfirmationCodeTypeIs;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotNull;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldMustBeNotNullIfEmailConfirmationCodeTypeIs(
        emailConfirmationCodeType = EmailConfirmationCodeType.CONFIRM_EMAIL,
        field = "email",
        emailConfirmationCodeTypeField = "type",
        message = "CONFIRM_EMAIL confirmation code type requires \"email\" field to be present",
        acceptEmpty = false
)
@FieldMustBeNotNullIfEmailConfirmationCodeTypeIs(
        emailConfirmationCodeType = EmailConfirmationCodeType.CONFIRM_PASSWORD_RECOVERY,
        field = "email",
        emailConfirmationCodeTypeField = "type",
        message = "CONFIRM_PASSWORD_RECOVERY confirmation code type requires \"email\" field to be present",
        acceptEmpty = false
)
public class CreateEmailConfirmationCodeRequest {
    @Email
    private String email;

    @NotNull
    private Language language;

    @NotNull
    private EmailConfirmationCodeType type;
}
