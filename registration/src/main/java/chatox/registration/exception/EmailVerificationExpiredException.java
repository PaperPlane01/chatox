package chatox.registration.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.GONE)
public class EmailVerificationExpiredException extends RuntimeException {
    public EmailVerificationExpiredException() {
    }

    public EmailVerificationExpiredException(String message) {
        super(message);
    }

    public EmailVerificationExpiredException(String message, Throwable cause) {
        super(message, cause);
    }
}
