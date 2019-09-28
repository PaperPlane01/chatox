package chatox.oauth2.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidAuthorizedGrantTypeException extends RuntimeException {
    public InvalidAuthorizedGrantTypeException() {
    }

    public InvalidAuthorizedGrantTypeException(String message) {
        super(message);
    }

    public InvalidAuthorizedGrantTypeException(String message, Throwable cause) {
        super(message, cause);
    }
}
