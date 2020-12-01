package chatox.platform.pagination.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidSortingDirectionException extends RuntimeException {
    public InvalidSortingDirectionException() {
    }

    public InvalidSortingDirectionException(String message) {
        super(message);
    }

    public InvalidSortingDirectionException(String message, Throwable cause) {
        super(message, cause);
    }
}
