package chatox.chat.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.NOT_FOUND)
class MessageReactionNotFoundException(
    messageId: String, emojiId: String, userId: String
) : RuntimeException("Could not find reaction of $emojiId for message $messageId created by user $userId")
