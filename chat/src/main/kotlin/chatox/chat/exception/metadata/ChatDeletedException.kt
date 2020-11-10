package chatox.chat.exception.metadata

import chatox.chat.model.ChatDeletion
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.NOT_FOUND)
class ChatDeletedException(chatDeletion: ChatDeletion?) : MetadataEnhancedException(
        metadata = ExceptionMetadata(
                errorCode = "CHAT_DELETED",
                additional = if (chatDeletion != null)
                    mapOf(
                            Pair("reason", chatDeletion.deletionReason.name),
                            Pair("comment", chatDeletion.comment ?: "")
                    )
                else null
))
