package chatox.chat.controller

import chatox.chat.api.request.CreateChatRequest
import chatox.chat.api.request.DeleteChatRequest
import chatox.chat.api.request.DeleteMultipleChatsRequest
import chatox.chat.api.request.UpdateChatRequest
import chatox.chat.service.ChatService
import chatox.platform.pagination.PaginationRequest
import chatox.platform.pagination.annotation.PageSize
import chatox.platform.pagination.annotation.PaginationConfig
import chatox.platform.pagination.annotation.SortBy
import chatox.platform.security.reactive.annotation.ReactivePermissionCheck
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
    //language=SpEL
    @ReactivePermissionCheck("@chatPermissions.canCreateChat()")
    @PostMapping
    fun createChat(@RequestBody @Valid createChatRequest: CreateChatRequest) = chatService.createChat(createChatRequest)

    @PreAuthorize("hasRole('USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatPermissions.canUpdateChat(#id)")
    @PutMapping("/{id}")
    fun updateChat(@PathVariable id: String,
                   @RequestBody @Valid updateChatRequest: UpdateChatRequest) = chatService.updateChat(id, updateChatRequest)

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping
    fun deleteMultipleChats(@RequestBody @Valid deleteMultipleChatsRequest: DeleteMultipleChatsRequest) = chatService.deleteMultipleChats(deleteMultipleChatsRequest)

    @PreAuthorize("hasRole('USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatPermissions.canDeleteChat(#id)")
    @DeleteMapping("/{id}")
    fun deleteChat(@PathVariable id: String,
                   @RequestBody(required = false) deleteChatRequest: DeleteChatRequest?) = chatService.deleteChat(id, deleteChatRequest)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    @GetMapping("/my")
    fun getChatsOfCurrentUser() = chatService.getChatsOfCurrentUser()

    @GetMapping("/{idOrSlug}")
    fun findChatByIdOrSlug(@PathVariable idOrSlug: String) = chatService.findChatBySlugOrId(idOrSlug)

    @PreAuthorize("hasAuthority('SCOPE_internal_reports_service')")
    @GetMapping("/{id}/with-creator-id")
    fun findChatByIdAndIncludeCreatorId(@PathVariable id: String) = chatService.findChatById(id);

    @PaginationConfig(
            sortBy = SortBy(allowed = ["createdAt", "name"], defaultValue = "createdAt")
    )
    @GetMapping
    fun searchChats(@RequestParam query: String,
                    paginationRequest: PaginationRequest) = chatService.searchChats(query, paginationRequest)

    @GetMapping("/slug/{slug}/isAvailable")
    fun isChatSlugAvailable(@PathVariable slug: String) = chatService.checkChatSlugAvailability(slug)

    @PaginationConfig(
            pageSize = PageSize(defaultValue = 10, max = 300),
            sortBy = SortBy(allowed = [], defaultValue = "")
    )
    @GetMapping("/popular")
    fun getPopularChats(paginationRequest: PaginationRequest) = chatService.getPopularChats(paginationRequest)
}
