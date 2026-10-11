package chatox.chat.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.CONFLICT)
class UserAlreadyReactedToMessageException(
    userId: String, messageId: String
) : RuntimeException("User $userId is already reacted to a message $messageId") {
}