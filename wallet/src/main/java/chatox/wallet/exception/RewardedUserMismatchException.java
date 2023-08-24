package chatox.wallet.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class RewardedUserMismatchException extends RuntimeException {
    public RewardedUserMismatchException() {
        super("This reward is for another user");
    }
}
