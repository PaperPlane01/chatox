package chatox.chat.exception.metadata

import chatox.chat.model.ChatDeletion
import chatox.platform.exception.metadata.ExceptionMetadata
import chatox.platform.exception.metadata.MetadataEnhancedException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.NOT_FOUND)
class ChatDeletedException(chatDeletion: ChatDeletion?) : MetadataEnhancedException(
        ExceptionMetadata.builder()
                .errorCode("CHAT_DELETED")
                .additional(
                        if (chatDeletion != null)
                            mapOf(
                                    Pair("reason", chatDeletion.deletionReason.name),
                                    Pair("comment", chatDeletion.comment ?: "")
                            )
                        else null
                )
                .build()
)
