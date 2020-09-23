package chatox.chat.controller

import chatox.chat.api.request.CreateChatRequest
import chatox.chat.api.request.UpdateChatRequest
import chatox.chat.service.ChatService
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
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import javax.validation.Valid

@RestController
@RequestMapping("/api/v1/chats")
class ChatController(private val chatService: ChatService) {

    @PreAuthorize("hasRole('USER')")
    @PostMapping
    fun createChat(@RequestBody @Valid createChatRequest: CreateChatRequest) = chatService.createChat(createChatRequest)

    @PreAuthorize("hasRole('USER')")
    @PutMapping("/{id}")
    fun updateChat(@PathVariable id: String,
                   @RequestBody @Valid updateChatRequest: UpdateChatRequest) = chatService.updateChat(id, updateChatRequest)

    @PreAuthorize("hasRole('USER')")
    @DeleteMapping("/{id}")
    fun deleteChat(@PathVariable id: String) = chatService.deleteChat(id)

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/my")
    fun getChatsOfCurrentUser() = chatService.getChatsOfCurrentUser()

    @GetMapping("/{idOrSlug}")
    fun findChatByIdOrSlug(@PathVariable idOrSlug: String) = chatService.findChatBySlugOrId(idOrSlug)

    @PaginationConfig(
            sortBy = SortBy(allowed = ["createdAt", "name"], default = "createdAt")
    )
    @GetMapping
    fun searchChats(@RequestParam query: String,
                    paginationRequest: PaginationRequest) = chatService.searchChats(query, paginationRequest)

    @GetMapping("/slug/{slug}/isAvailable")
    fun isChatSlugAvailable(@PathVariable slug: String) = chatService.checkChatSlugAvailability(slug)
}
