package chatox.platform.security.confirmation;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ConfirmationTokenContext {
    private ConfirmationTokenPayload confirmationToken;
}
