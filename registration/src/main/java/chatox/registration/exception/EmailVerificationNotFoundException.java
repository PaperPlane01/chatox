package chatox.registration.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class EmailVerificationNotFoundException extends RuntimeException {
    public EmailVerificationNotFoundException() {
    }

    public EmailVerificationNotFoundException(String message) {
        super(message);
    }

    public EmailVerificationNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
