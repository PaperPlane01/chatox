package chatox.registration.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class UserNameAlreadyTakenException extends RuntimeException {
    public UserNameAlreadyTakenException() {
    }

    public UserNameAlreadyTakenException(String message) {
        super(message);
    }

    public UserNameAlreadyTakenException(String message, Throwable cause) {
        super(message, cause);
    }
}
