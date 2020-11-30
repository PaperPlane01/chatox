package chatox.oauth2.exception.metadata;

import chatox.platform.exception.metadata.ExceptionMetadata;
import chatox.platform.exception.metadata.MetadataEnhancedException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class EmailMismatchException extends MetadataEnhancedException {
    private static final ExceptionMetadata METADATA = ExceptionMetadata.builder()
            .errorCode("EMAIL_MISMATCH")
            .build();

    public EmailMismatchException() {
        super(METADATA);
    }

    public EmailMismatchException(String message) {
        super(message, METADATA);
    }

    public EmailMismatchException(String message, Throwable cause) {
        super(message, cause, METADATA);
    }
}
