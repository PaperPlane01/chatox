package chatox.chat.exception.metadata

import chatox.platform.exception.metadata.ExceptionMetadata
import chatox.platform.exception.metadata.MetadataEnhancedException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.NOT_FOUND)
class EmojiNotFoundException(emojiId: String) : MetadataEnhancedException(
    "Could not find emoji $emojiId",
    ExceptionMetadata.builder()
        .errorCode("EMOJI_NOT_FOUND")
        .build()
) {
    constructor(emojiIds: Collection<String>) : this(emojiIds.joinToString(","))
}