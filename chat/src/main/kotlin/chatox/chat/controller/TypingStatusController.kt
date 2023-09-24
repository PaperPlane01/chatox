package chatox.chat.controller

import chatox.chat.service.TypingStatusService
import chatox.platform.security.reactive.annotation.ReactivePermissionCheck
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/chats")
class TypingStatusController(private val typingStatusService: TypingStatusService) {

    //language=SpEL
    @ReactivePermissionCheck("@messagePermissions.canSendTypingStatus(#chatId)")
    @PostMapping("/{chatId}/typing")
    fun publishUserStartedTyping(
            @PathVariable chatId: String
    ) = typingStatusService.publishCurrentUserStartedTyping(chatId)
}