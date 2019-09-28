package chatox.oauth2.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidScopeException extends RuntimeException {
    public InvalidScopeException() {
    }

    public InvalidScopeException(String message) {
        super(message);
    }

    public InvalidScopeException(String message, Throwable cause) {
        super(message, cause);
    }
}
