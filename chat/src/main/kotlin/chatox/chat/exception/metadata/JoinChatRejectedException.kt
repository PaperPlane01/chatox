package chatox.chat.exception.metadata

import chatox.chat.model.JoinChatRejectionReason
import chatox.platform.exception.metadata.ExceptionMetadata
import chatox.platform.exception.metadata.MetadataEnhancedException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.FORBIDDEN)
class JoinChatRejectedException(reason: JoinChatRejectionReason) : MetadataEnhancedException(
        ExceptionMetadata.builder()
                .errorCode("JOIN_CHAT_REJECTED")
                .additional(mapOf(
                        Pair("reason", reason.name)
                ))
                .build()
)