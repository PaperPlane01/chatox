package chatox.chat.exception.metadata

import chatox.platform.exception.metadata.ExceptionMetadata
import chatox.platform.exception.metadata.MetadataEnhancedException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.FORBIDDEN)
class LimitOfScheduledMessagesReachedException(override val message: String?, private val allowedNumberOfScheduledMessages: Int = 10) : MetadataEnhancedException(
        message,
        ExceptionMetadata.builder()
                .errorCode("LIMIT_OF_SCHEDULED_MESSAGES_REACHED")
                .additional(
                        mapOf(
                                Pair("allowedNumberOfScheduledMessages", "$allowedNumberOfScheduledMessages")
                        )
                )
                .build()
)
