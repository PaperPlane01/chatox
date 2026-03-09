package chatox.platform.security.confirmation;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

@Data
@AllArgsConstructor
public class ConfirmationTokenPayload {
    private String userId;
    private List<ConfirmationTokenAction> actions;

    public static ConfirmationTokenPayload from(Jwt jwt) {
        var userId = jwt.getClaimAsString(ConfirmationTokenClaim.USER_ID.getValue());
        var actions = jwt.getClaimAsStringList(ConfirmationTokenClaim.ACTIONS.getValue())
                .stream()
                .flatMap(action -> ConfirmationTokenAction.fromString(action).stream())
                .toList();

        return new ConfirmationTokenPayload(userId, actions);
    }
}
