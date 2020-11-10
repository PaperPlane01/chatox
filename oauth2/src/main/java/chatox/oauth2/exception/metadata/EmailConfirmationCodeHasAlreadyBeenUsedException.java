package chatox.oauth2.exception.metadata;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.GONE)
public class EmailConfirmationCodeHasAlreadyBeenUsedException extends MetadataEnhancedException {
    private static final ExceptionMetadata METADATA = ExceptionMetadata.builder()
            .errorCode("EMAIL_CONFIRMATION_CODE_HAS_BEEN_USED")
            .build();

    public EmailConfirmationCodeHasAlreadyBeenUsedException() {
        super(METADATA);
    }

    public EmailConfirmationCodeHasAlreadyBeenUsedException(String message) {
        super(message, METADATA);
    }

    public EmailConfirmationCodeHasAlreadyBeenUsedException(String message, Throwable cause) {
        super(message, cause, METADATA);
    }
}
