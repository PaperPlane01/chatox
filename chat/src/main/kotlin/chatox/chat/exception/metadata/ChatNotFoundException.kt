package chatox.chat.exception.metadata

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.NOT_FOUND)
class ChatNotFoundException(override val message: String?) : MetadataEnhancedException(
        message = message,
        metadata = ExceptionMetadata(
                errorCode =  "CHAT_NOT_FOUND"
        )
)
