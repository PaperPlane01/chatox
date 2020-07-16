package chatox.registration.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class EmailMismatchException extends RuntimeException {
    public EmailMismatchException() {
    }

    public EmailMismatchException(String message) {
        super(message);
    }

    public EmailMismatchException(String message, Throwable cause) {
        super(message, cause);
    }
}
