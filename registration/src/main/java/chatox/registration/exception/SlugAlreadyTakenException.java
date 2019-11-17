package chatox.registration.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class SlugAlreadyTakenException extends RuntimeException {
    public SlugAlreadyTakenException() {
    }

    public SlugAlreadyTakenException(String message) {
        super(message);
    }

    public SlugAlreadyTakenException(String message, Throwable cause) {
        super(message, cause);
    }
}
