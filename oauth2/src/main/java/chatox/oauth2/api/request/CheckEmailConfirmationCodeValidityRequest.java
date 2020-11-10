package chatox.oauth2.api.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CheckEmailConfirmationCodeValidityRequest {
    @NotBlank
    private String confirmationCode;
}
