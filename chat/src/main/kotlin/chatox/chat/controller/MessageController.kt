package chatox.chat.controller

import chatox.chat.api.request.CreateMessageRequest
import chatox.chat.api.request.UpdateMessageRequest
import chatox.chat.service.MessageService
import chatox.chat.support.pagination.PaginationRequest
import chatox.chat.support.pagination.annotation.PageSize
import chatox.chat.support.pagination.annotation.PaginationConfig
import chatox.chat.support.pagination.annotation.SortBy
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import javax.validation.Valid

@RestController
class MessageController(private val messageService: MessageService) {

    @PostMapping("/api/v1/chat/{chatId}/messages")
    @PreAuthorize("hasRole('USER')")
    fun createMessage(@PathVariable chatId: String,
                      @RequestBody @Valid createMessageRequest: CreateMessageRequest
    ) = messageService.createMessage(chatId, createMessageRequest)

    @PutMapping("/api/v1/chat/{chatId}/messages/{messageId}")
    @PreAuthorize("hasRole('USER')")
    fun updateMessage(@PathVariable chatId: String,
                      @PathVariable messageId: String,
                      @RequestBody @Valid updateMessageRequest: UpdateMessageRequest
    ) = messageService.updateMessage(messageId, chatId,updateMessageRequest)

    @DeleteMapping("/api/v1/chat/{chatId}/messages/{messageId}")
    @PreAuthorize("hasRole('USER')")
    fun deleteMessage(@PathVariable chatId: String,
                      @PathVariable messageId: String
    ) = messageService.deleteMessage(messageId, chatId)

    @PaginationConfig(
            pageSize = PageSize(default = 200, max = 300),
            sortBy = SortBy(default = "createdAt", allowed = ["createdAt"])
    )
    @GetMapping("/api/v1/chat/{chatId}/messages")
    fun findMessagesByChat(@PathVariable chatId: String,
                           paginationRequest: PaginationRequest
    ) = messageService.findMessagesByChat(chatId, paginationRequest)

    @PaginationConfig(
            pageSize = PageSize(default = 200, max = 300),
            sortBy = SortBy(default = "createdAt", allowed = ["createdAt"])
    )
    @GetMapping("/api/v1/chat/{chatId}/messages", params = ["beforeId"])
    fun findMessagesByChatBeforeMessage(
            @PathVariable chatId: String,
            @RequestParam beforeId: String,
            paginationRequest: PaginationRequest
    ) = messageService.findMessagesBeforeMessageByChat(chatId, beforeId, paginationRequest)

    @PaginationConfig(
            pageSize = PageSize(default = 200, max = 300),
            sortBy = SortBy(default = "createdAt", allowed = ["createdAt"])
    )
    @GetMapping("/api/v1/chat/{chatId}/messages", params = ["afterId"])
    fun findMessagesByChatAfterMessage(
            @PathVariable chatId: String,
            @RequestParam afterId: String,
            paginationRequest: PaginationRequest
    ) = messageService.findMessagesSinceMessageByChat(chatId, afterId, paginationRequest)

    @PostMapping("/api/v1/chat/{chatId}/messages/{messageId}/read")
    fun markMessageRead(@PathVariable chatId: String,
                        @PathVariable messageId: String
    ) = messageService.markMessageRead(messageId)
}
