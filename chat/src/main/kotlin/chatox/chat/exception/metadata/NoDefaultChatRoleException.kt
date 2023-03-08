package chatox.chat.exception.metadata

import chatox.platform.exception.metadata.ExceptionMetadata
import chatox.platform.exception.metadata.MetadataEnhancedException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
class NoDefaultChatRoleException(override val message: String?) : MetadataEnhancedException(
        message,
        ExceptionMetadata.builder()
                .errorCode("NO_DEFAULT_CHAT_ROLE")
                .build()
)