package chatox.platform.pagination.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidSortByException extends RuntimeException {
    public InvalidSortByException() {
    }

    public InvalidSortByException(String message) {
        super(message);
    }

    public InvalidSortByException(String message, Throwable cause) {
        super(message, cause);
    }
}
