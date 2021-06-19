package chatox.chat.exception.metadata

import chatox.platform.exception.metadata.ExceptionMetadata
import chatox.platform.exception.metadata.MetadataEnhancedException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.NOT_FOUND)
class StickerNotFoundException(override val message: String?) : MetadataEnhancedException(
        message,
        ExceptionMetadata.builder()
                .errorCode("STICKER_NOT_FOUND")
                .build()
)
