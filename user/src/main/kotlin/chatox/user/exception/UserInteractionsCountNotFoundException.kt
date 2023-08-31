package chatox.user.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.NOT_FOUND)
class UserInteractionsCountNotFoundException(userId: String) : RuntimeException(
        "Could not find user interactions count for user $userId. Either user doesn't exist, or " +
                "interactions count hasn't been created yet."
)