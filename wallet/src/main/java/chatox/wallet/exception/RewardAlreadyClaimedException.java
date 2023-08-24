package chatox.wallet.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class RewardAlreadyClaimedException extends RuntimeException {
    public RewardAlreadyClaimedException() {
        super("This reward has already been claimed");
    }
}
