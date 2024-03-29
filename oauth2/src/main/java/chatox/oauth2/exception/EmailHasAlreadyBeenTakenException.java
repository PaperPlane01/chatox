package chatox.oauth2.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class EmailHasAlreadyBeenTakenException extends RuntimeException {
    public EmailHasAlreadyBeenTakenException() {
    }

    public EmailHasAlreadyBeenTakenException(String message) {
        super(message);
    }

    public EmailHasAlreadyBeenTakenException(String message, Throwable cause) {
        super(message, cause);
    }
}
