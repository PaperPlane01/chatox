package chatox.chat.controller

import chatox.chat.api.request.CreateChatBlockingRequest
import chatox.chat.api.request.UpdateChatBlockingRequest
import chatox.chat.service.ChatBlockingService
import chatox.platform.pagination.PaginationRequest
import chatox.platform.pagination.annotation.PaginationConfig
import chatox.platform.pagination.annotation.SortBy
import chatox.platform.pagination.annotation.SortDirection
import chatox.platform.security.reactive.annotation.ReactivePermissionCheck
import jakarta.validation.Valid
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/chats")
class ChatBlockingController(private val chatBlockingService: ChatBlockingService) {

    @PreAuthorize("hasRole('USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatBlockingPermissions.canBlockUser(#chatId, #createChatBlockingRequest)")
    @PostMapping("/{chatId}/blockings")
    fun createChatBlocking(@PathVariable chatId: String,
                           @RequestBody @Valid createChatBlockingRequest: CreateChatBlockingRequest
    ) = chatBlockingService.blockUser(chatId, createChatBlockingRequest)

    @PreAuthorize("hasRole('USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatBlockingPermissions.canSeeChatBlockings(#chatId)")
    @PaginationConfig(
            sortBy = SortBy(
                    allowed = [
                        "createdAt",
                        "blockedUntil"
                    ],
                    defaultValue = "createdAt"
            ),
            sortingDirection = SortDirection(defaultValue = "desc")
    )
    @GetMapping("/{chatId}/blockings")
    fun getAllBlockingsByChat(@PathVariable chatId: String,
                              paginationRequest: PaginationRequest
    ) = chatBlockingService.getAllBlockingsByChat(chatId, paginationRequest)

    @PreAuthorize("hasRole('USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatBlockingPermissions.canSeeChatBlockings(#chatId)")
    @PaginationConfig(
            sortBy = SortBy(
                    allowed = [
                        "createdAt",
                        "blockedUntil"
                    ],
                    defaultValue = "createdAt"
            ),
            sortingDirection = SortDirection(defaultValue = "desc")
    )
    @GetMapping("/{chatId}/blockings/active")
    fun getActiveBlockingsByChat(@PathVariable chatId: String,
                                 paginationRequest: PaginationRequest
    ) = chatBlockingService.getActiveBlockingsByChat(chatId, paginationRequest)

    @PreAuthorize("hasRole('USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatBlockingPermissions.canSeeChatBlockings(#chatId)")
    @PaginationConfig(
            sortBy = SortBy(
                    allowed = [
                        "createdAt",
                        "blockedUntil"
                    ],
                    defaultValue = "createdAt"
            ),
            sortingDirection = SortDirection(defaultValue = "desc")
    )
    @GetMapping("/{chatId}/blockings/nonActive")
    fun getNonActiveBlockingsByChat(@PathVariable chatId: String,
                                    paginationRequest: PaginationRequest
    ) = chatBlockingService.getNonActiveBlockingsByChat(chatId, paginationRequest)

    @PreAuthorize("hasRole('USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatBlockingPermissions.canSeeChatBlockings(#chatId)")
    @GetMapping("/{chatId}/blockings/{blockingId}")
    fun findChatBlockingById(@PathVariable chatId: String,
                             @PathVariable blockingId: String
    ) = chatBlockingService.getBlockingById(chatId, blockingId)

    @PreAuthorize("hasRole('USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatBlockingPermissions.canUpdateBlocking(#chatId)")
    @PutMapping("/{chatId}/blockings/{blockingId}")
    fun updateChatBlocking(@PathVariable chatId: String,
                           @PathVariable blockingId: String,
                           @RequestBody @Valid updateChatBlockingRequest: UpdateChatBlockingRequest
    ) = chatBlockingService.updateBlocking(chatId, blockingId, updateChatBlockingRequest)

    @PreAuthorize("hasRole('USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatBlockingPermissions.canUnblockUser(#chatId)")
    @DeleteMapping("/{chatId}/blockings/{blockingId}")
    fun cancelChatBlocking(@PathVariable chatId: String,
                           @PathVariable blockingId: String
    ) = chatBlockingService.unblockUser(chatId, blockingId)
}

