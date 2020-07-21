package chatox.registration.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class AccountRegistrationException extends RuntimeException {
    public AccountRegistrationException() {
    }

    public AccountRegistrationException(String message) {
        super(message);
    }

    public AccountRegistrationException(String message, Throwable cause) {
        super(message, cause);
    }
}
