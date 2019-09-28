package chatox.oauth2.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class InternalUsesScopeException extends RuntimeException {
    public InternalUsesScopeException() {
    }

    public InternalUsesScopeException(String message) {
        super(message);
    }

    public InternalUsesScopeException(String message, Throwable cause) {
        super(message, cause);
    }
}
