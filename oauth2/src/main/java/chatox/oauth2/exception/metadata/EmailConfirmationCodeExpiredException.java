package chatox.oauth2.exception.metadata;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.GONE)
public class EmailConfirmationCodeExpiredException extends MetadataEnhancedException {
    private static final ExceptionMetadata METADATA = ExceptionMetadata.builder()
            .errorCode("EMAIL_CONFIRMATION_CODE_EXPIRED")
            .build();

    public EmailConfirmationCodeExpiredException() {
        super(METADATA);
    }

    public EmailConfirmationCodeExpiredException(String message) {
        super(message, METADATA);
    }

    public EmailConfirmationCodeExpiredException(String message, Throwable cause) {
        super(message, cause, METADATA);
    }
}
