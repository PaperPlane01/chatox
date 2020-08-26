package chatox.oauth2.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class EmailConfirmationIdRequiredException extends RuntimeException {
    public EmailConfirmationIdRequiredException() {
    }

    public EmailConfirmationIdRequiredException(String message) {
        super(message);
    }

    public EmailConfirmationIdRequiredException(String message, Throwable cause) {
        super(message, cause);
    }
}
