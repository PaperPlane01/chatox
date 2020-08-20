package chatox.oauth2.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class EmailConfirmationCodeNotFoundException extends RuntimeException {
    public EmailConfirmationCodeNotFoundException() {
    }

    public EmailConfirmationCodeNotFoundException(String message) {
        super(message);
    }

    public EmailConfirmationCodeNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
