package chatox.chat.controller

import chatox.chat.service.MessageService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/messages")
class InternalMessageController(private val messageService: MessageService) {

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_internal_reports_service')")
    fun findMessageById(@PathVariable id: String) = messageService.findMessageById(id)
}
