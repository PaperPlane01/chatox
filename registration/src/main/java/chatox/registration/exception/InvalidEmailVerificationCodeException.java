package chatox.registration.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidEmailVerificationCodeException extends RuntimeException {
    public InvalidEmailVerificationCodeException() {
    }

    public InvalidEmailVerificationCodeException(String message) {
        super(message);
    }

    public InvalidEmailVerificationCodeException(String message, Throwable cause) {
        super(message, cause);
    }
}
