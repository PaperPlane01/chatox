package chatox.oauth2.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class EmailConfirmationCodeRequiredException extends RuntimeException {
    public EmailConfirmationCodeRequiredException() {
    }

    public EmailConfirmationCodeRequiredException(String message) {
        super(message);
    }

    public EmailConfirmationCodeRequiredException(String message, Throwable cause) {
        super(message, cause);
    }
}
