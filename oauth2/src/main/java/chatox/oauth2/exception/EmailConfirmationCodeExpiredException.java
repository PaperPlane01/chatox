package chatox.oauth2.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.GONE)
public class EmailConfirmationCodeExpiredException extends RuntimeException {
    public EmailConfirmationCodeExpiredException() {
    }

    public EmailConfirmationCodeExpiredException(String message) {
        super(message);
    }

    public EmailConfirmationCodeExpiredException(String message, Throwable cause) {
        super(message, cause);
    }
}
