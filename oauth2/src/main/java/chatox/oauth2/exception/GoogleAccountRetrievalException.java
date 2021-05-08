package chatox.oauth2.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class GoogleAccountRetrievalException extends RuntimeException {
    public GoogleAccountRetrievalException() {
    }

    public GoogleAccountRetrievalException(String message) {
        super(message);
    }

    public GoogleAccountRetrievalException(String message, Throwable cause) {
        super(message, cause);
    }
}
