package chatox.platform.exception.metadata;

import lombok.Getter;

public class MetadataEnhancedException extends RuntimeException {
    @Getter
    private ExceptionMetadata metadata;

    public MetadataEnhancedException(ExceptionMetadata exceptionMetadata) {
        this.metadata = exceptionMetadata;
    }

    public MetadataEnhancedException(String message, ExceptionMetadata exceptionMetadata) {
        super(message);
        this.metadata = exceptionMetadata;
    }

    public MetadataEnhancedException(String message, Throwable cause, ExceptionMetadata exceptionMetadata) {
        super(message, cause);
        this.metadata = exceptionMetadata;
    }
}
