package chatox.oauth2.api.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CheckEmailConfirmationCodeValidityRequest {
    @NotBlank
    private String confirmationCode;
}
