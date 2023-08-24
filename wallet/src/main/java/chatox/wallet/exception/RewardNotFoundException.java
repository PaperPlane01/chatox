package chatox.wallet.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class RewardNotFoundException extends RuntimeException {
    public RewardNotFoundException() {
    }

    public RewardNotFoundException(String rewardId) {
        super("Could not find reward with id " + rewardId);
    }

    public RewardNotFoundException(String rewardId, Throwable cause) {
        super("Could not find reward with id " + rewardId, cause);
    }
}
