package chatox.oauth2.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class EmailConfirmationVerificationCodeRequiredException extends RuntimeException {
    public EmailConfirmationVerificationCodeRequiredException() {
    }

    public EmailConfirmationVerificationCodeRequiredException(String message) {
        super(message);
    }

    public EmailConfirmationVerificationCodeRequiredException(String message, Throwable cause) {
        super(message, cause);
    }
}
