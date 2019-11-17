package chatox.chat.controller

import chatox.chat.api.request.CreateChatRequest
import chatox.chat.api.request.UpdateChatRequest
import chatox.chat.service.ChatService
import chatox.chat.support.pagination.PaginationRequest
import chatox.chat.support.pagination.annotation.PageSize
import chatox.chat.support.pagination.annotation.PaginationConfig
import chatox.chat.support.pagination.annotation.SortBy
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
class ChatController(private val chatService: ChatService) {

    @PostMapping("/api/v1/chat")
    fun createChat(@RequestBody @Valid createChatRequest: CreateChatRequest) = chatService.createChat(createChatRequest)

    @PutMapping("/api/v1/chat/{id}")
    fun updateChat(@PathVariable id: String,
                   @RequestBody @Valid updateChatRequest: UpdateChatRequest) = chatService.updateChat(id, updateChatRequest)

    @DeleteMapping("/api/v1/chat/{id}")
    fun deleteChat(@PathVariable id: String) = chatService.deleteChat(id)

    @GetMapping("/api/v1/chat/my")
    fun getChatsOfCurrentUser() = chatService.getChatsOfCurrentUser()

    @GetMapping("/api/v1/chat/{idOrSlug}")
    fun findChatByIdOrSlug(@PathVariable idOrSlug: String) = chatService.findChatBySlugOrId(idOrSlug)

    @PaginationConfig(
            sortBy = SortBy(allowed = ["createdAt", "name"], default = "createdAt")
    )
    @GetMapping("/api/v1/chat")
    fun searchChats(@RequestParam query: String,
                    paginationRequest: PaginationRequest) = chatService.searchChats(query, paginationRequest)
}
