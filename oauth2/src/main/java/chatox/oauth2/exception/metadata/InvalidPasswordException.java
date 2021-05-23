package chatox.oauth2.exception.metadata;

import chatox.platform.exception.metadata.ExceptionMetadata;
import chatox.platform.exception.metadata.MetadataEnhancedException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class InvalidPasswordException extends MetadataEnhancedException {
    private static final ExceptionMetadata METADATA = ExceptionMetadata.builder()
            .errorCode("INVALID_PASSWORD")
            .build();

    public InvalidPasswordException() {
        super(METADATA);
    }

    public InvalidPasswordException(String message) {
        super(message, METADATA);
    }

    public InvalidPasswordException(String message, Throwable cause) {
        super(message, cause, METADATA);
    }
}
