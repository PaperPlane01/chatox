package chatox.chat.controller

import chatox.chat.api.request.CreateMessageRequest
import chatox.chat.api.request.UpdateMessageRequest
import chatox.chat.service.MessageService
import chatox.chat.support.pagination.PaginationRequest
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import javax.validation.Valid

@RestController
class MessageController(private val messageService: MessageService) {

    @PostMapping("/api/v1/chat/{chatId}/messages")
    fun createMessage(@PathVariable chatId: String,
                      @RequestBody @Valid createMessageRequest: CreateMessageRequest
    ) = messageService.createMessage(chatId, createMessageRequest)

    @PutMapping("/api/v1/chat/{chatId}/messages/{messageId}")
    fun updateMessage(@PathVariable chatId: String,
                      @PathVariable messageId: String,
                      @RequestBody @Valid updateMessageRequest: UpdateMessageRequest
    ) = messageService.updateMessage(messageId, updateMessageRequest)

    @DeleteMapping("/api/v1/chat/{chatId}/messages/{messageId}")
    fun deleteMessage(@PathVariable chatId: String,
                      @PathVariable messageId: String
    ) = messageService.deleteMessage(messageId)

    @GetMapping("/api/v1/chat/{chatId}/messages")
    fun findMessagesByChat(@PathVariable chatId: String,
                           paginationRequest: PaginationRequest
    ) = messageService.findMessagesByChat(chatId, paginationRequest)

    @PostMapping("/api/v1/chat/{chatId}/messages/{messageId}/read")
    fun markMessageRead(@PathVariable chatId: String,
                        @PathVariable messageId: String
    ) = messageService.markMessageRead(messageId)
}
