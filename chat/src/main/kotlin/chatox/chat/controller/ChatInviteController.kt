package chatox.chat.controller

import chatox.chat.api.request.CreateChatInviteRequest
import chatox.chat.api.request.UpdateChatInviteRequest
import chatox.chat.service.ChatInviteService
import chatox.platform.pagination.PaginationRequest
import chatox.platform.pagination.annotation.PaginationConfig
import chatox.platform.pagination.annotation.SortBy
import chatox.platform.pagination.annotation.SortDirection
import chatox.platform.security.reactive.annotation.ReactivePermissionCheck
import jakarta.validation.Valid
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/chats")
class ChatInviteController(private val chatInviteService: ChatInviteService) {

    @PreAuthorize("hasRole('USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatInvitePermissions.canManageChatInvites(#chatId)")
    @PostMapping("/{chatId}/invites")
    fun createChatInvite(
            @PathVariable chatId: String,
            @RequestBody @Valid createChatInviteRequest: CreateChatInviteRequest
    ) = chatInviteService.createChatInvite(chatId, createChatInviteRequest)

    @PaginationConfig(
            sortBy = SortBy(allowed = ["createdAt"], defaultValue = "createdAt"),
            sortingDirection = SortDirection(defaultValue = "desc")
    )
    @PreAuthorize("hasRole('USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatInvitePermissions.canManageChatInvites(#chatId)")
    @GetMapping("/{chatId}/invites")
    fun getChatInvites(
            @PathVariable chatId: String,
            @RequestParam(required = false, defaultValue = "false") activeOnly: Boolean,
            paginationRequest: PaginationRequest
    ) = chatInviteService.findChatInvites(chatId, activeOnly, paginationRequest)

    @PreAuthorize("hasRole('USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatInvitePermissions.canManageChatInvites(#chatId)")
    @PutMapping("/{chatId}/invites/{inviteId}")
    fun updateChatInvite(
            @PathVariable chatId: String,
            @PathVariable inviteId: String,
            @RequestBody @Valid updateChatInviteRequest: UpdateChatInviteRequest
    ) = chatInviteService.updateChatInvite(inviteId, chatId, updateChatInviteRequest)

    @PreAuthorize("hasRole('USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatInvitePermissions.canManageChatInvites(#chatId)")
    @GetMapping("/{chatId}/invites/{inviteId}")
    fun getChatInvite(
            @PathVariable chatId: String,
            @PathVariable inviteId: String
    ) = chatInviteService.findFullChatInvite(chatId, inviteId)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    @GetMapping("/invites/{inviteId}")
    fun getChatInviteById(@PathVariable inviteId: String) = chatInviteService.findChatInvite(inviteId)
}