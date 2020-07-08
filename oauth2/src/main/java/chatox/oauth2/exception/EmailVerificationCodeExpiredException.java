package chatox.oauth2.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.GONE)
public class EmailVerificationCodeExpiredException extends RuntimeException {
    public EmailVerificationCodeExpiredException() {
    }

    public EmailVerificationCodeExpiredException(String message) {
        super(message);
    }

    public EmailVerificationCodeExpiredException(String message, Throwable cause) {
        super(message, cause);
    }
}
