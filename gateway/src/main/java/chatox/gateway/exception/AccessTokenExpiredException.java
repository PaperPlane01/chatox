package chatox.gateway.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(
        value = HttpStatus.UNAUTHORIZED,
        reason = "Access token is either invalid or expired"
)
public class AccessTokenExpiredException extends RuntimeException {
    public AccessTokenExpiredException() {
    }

    public AccessTokenExpiredException(String message) {
        super(message);
    }
}
