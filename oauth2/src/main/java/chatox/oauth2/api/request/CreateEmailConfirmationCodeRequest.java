package chatox.oauth2.api.request;

import chatox.oauth2.domain.EmailConfirmationCodeType;
import chatox.oauth2.domain.Language;
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
public class CreateEmailConfirmationCodeRequest {
    @Email
    private String email;

    @NotNull
    private Language language;

    @NotNull
    private EmailConfirmationCodeType type;
}