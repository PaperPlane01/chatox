package chatox.platform.pagination.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidPageNumberException extends RuntimeException {
    public InvalidPageNumberException() {
    }

    public InvalidPageNumberException(String message) {
        super(message);
    }

    public InvalidPageNumberException(String message, Throwable cause) {
        super(message, cause);
    }
}
