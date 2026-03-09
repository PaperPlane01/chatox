package chatox.chat.exception.metadata

import chatox.platform.exception.metadata.ExceptionMetadata
import chatox.platform.exception.metadata.MetadataEnhancedException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.FORBIDDEN)
class ChatOwnershipTransferToAnonymousUserIsNotAllowedException(override val message: String? = null):
    MetadataEnhancedException(
        message,
        ExceptionMetadata.builder()
            .errorCode("CHAT_OWNERSHIP_TRANSFER_TO_ANONYMOUS_USER_IS_NOT_ALLOWED")
            .build()
    )