package chatox.oauth2.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class EmailNotProvidedException extends RuntimeException {
    public EmailNotProvidedException() {
    }

    public EmailNotProvidedException(String message) {
        super(message);
    }

    public EmailNotProvidedException(String message, Throwable cause) {
        super(message, cause);
    }
}
