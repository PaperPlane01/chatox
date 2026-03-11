package chatox.platform.security.confirmation;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum ConfirmationTokenClaim {
    USER_ID("user_id"),
    ACTIONS("actions");

    private final String value;
}
