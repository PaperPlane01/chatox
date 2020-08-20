package chatox.oauth2.exception.metadata;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class InvalidEmailConfirmationCodeCodeException extends MetadataEnhancedException {
    private static final ExceptionMetadata METADATA = ExceptionMetadata.builder()
            .errorCode("INVALID_EMAIL_CONFIRMATION_CODE")
            .build();

    public InvalidEmailConfirmationCodeCodeException() {
        super(METADATA);
    }

    public InvalidEmailConfirmationCodeCodeException(String message) {
        super(message, METADATA);
    }

    public InvalidEmailConfirmationCodeCodeException(String message, Throwable cause) {
        super(message, cause, METADATA);
    }
}
