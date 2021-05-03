package chatox.chat.controller

import chatox.chat.api.request.DeleteMultipleMessagesRequest
import chatox.chat.service.MessageService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import javax.validation.Valid

@RestController
@RequestMapping("/api/v1/messages")
class MessageController(private val messageService: MessageService) {

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_internal_reports_service')")
    fun findMessageById(@PathVariable id: String) = messageService.findMessageById(id)

    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteMultipleMessages(
            @RequestBody @Valid deleteMultipleMessagesRequest: DeleteMultipleMessagesRequest
    ) = messageService.deleteMultipleMessages(deleteMultipleMessagesRequest)
}
