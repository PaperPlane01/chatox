package chatox.oauth2.api.request;

import chatox.platform.security.confirmation.ConfirmationTokenAction;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateConfirmationTokenRequest {
    @NotNull
    private String password;

    @NotEmpty
    private List<ConfirmationTokenAction> actions;
}
