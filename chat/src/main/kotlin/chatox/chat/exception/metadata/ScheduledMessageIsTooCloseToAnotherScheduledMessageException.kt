package chatox.chat.exception.metadata

import chatox.platform.exception.metadata.ExceptionMetadata
import chatox.platform.exception.metadata.MetadataEnhancedException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.FORBIDDEN)
class ScheduledMessageIsTooCloseToAnotherScheduledMessageException(override val message: String?) : MetadataEnhancedException(
        message,
        ExceptionMetadata.builder()
                .errorCode("SCHEDULED_MESSAGE_IS_TOO_CLOSE_TO_ANOTHER_SCHEDULED_MESSAGE")
                .build()
)
