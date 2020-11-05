package chatox.chat.exception.metadata

open class MetadataEnhancedException : RuntimeException {
    var metadata: ExceptionMetadata

    constructor(metadata: ExceptionMetadata) : super() {
        this.metadata = metadata
    }

    constructor(message: String?, metadata: ExceptionMetadata) : super(message) {
        this.metadata = metadata
    }
}
