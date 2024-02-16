package chatox.chat.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.NOT_FOUND)
class ChatInviteNotFoundException : RuntimeException {
    constructor() : super()
    constructor(id: String) : super("Could find chat invite with id $id")
}