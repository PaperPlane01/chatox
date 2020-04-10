package chatox.chat.controller

import chatox.chat.api.request.CreateChatBlockingRequest
import chatox.chat.api.request.UpdateChatBlockingRequest
import chatox.chat.service.ChatBlockingService
import chatox.chat.support.pagination.PaginationRequest
import chatox.chat.support.pagination.annotation.PaginationConfig
import chatox.chat.support.pagination.annotation.SortBy
import chatox.chat.support.pagination.annotation.SortDirection
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import javax.validation.Valid

@RestController
class ChatBlockingController(private val chatBlockingService: ChatBlockingService) {

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/api/v1/chat/{chatId}/blockings")
    fun createChatBlocking(@PathVariable chatId: String,
                           @RequestBody @Valid createChatBlockingRequest: CreateChatBlockingRequest
    ) = chatBlockingService.blockUser(chatId, createChatBlockingRequest)

    @PaginationConfig(
            sortBy = SortBy(
                    allowed = ["createdAt", "blockedUntil", "blockedUser", "blockedBy"],
                    default = "createdAt"
            ),
            sortingDirection = SortDirection(default = "desc")
    )
    @GetMapping("/api/v1/chat/{chatId}/blockings")
    fun getAllBlockingsByChat(@PathVariable chatId: String,
                              paginationRequest: PaginationRequest
    ) = chatBlockingService.getAllBlockingsByChat(chatId, paginationRequest)

    @PaginationConfig(
            sortBy = SortBy(
                    allowed = ["createdAt", "blockedUntil", "blockedUser", "blockedBy"],
                    default = "createdAt"
            ),
            sortingDirection = SortDirection(default = "desc")
    )
    @GetMapping("/api/v1/chat/{chatId}/blockings/active")
    fun getActiveBlockingsByChat(@PathVariable chatId: String,
                                 paginationRequest: PaginationRequest
    ) = chatBlockingService.getActiveBlockingsByChat(chatId, paginationRequest)

    @PaginationConfig(
            sortBy = SortBy(
                    allowed = ["createdAt", "blockedUntil", "blockedUser", "blockedBy"],
                    default = "createdAt"
            ),
            sortingDirection = SortDirection(default = "desc")
    )
    @GetMapping("/api/v1/chat/{chatId}/blockings/nonActive")
    fun getNonActiveBlockingsByChat(@PathVariable chatId: String,
                                    paginationRequest: PaginationRequest
    ) = chatBlockingService.getNonActiveBlockingsByChat(chatId, paginationRequest)

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/api/v1/chat/{chatId}/blockings/{blockingId}")
    fun findChatBlockingById(@PathVariable chatId: String,
                             @PathVariable blockingId: String
    ) = chatBlockingService.getBlockingById(chatId, blockingId)

    @PreAuthorize("hasRole('USER')")
    @PutMapping("/api/v1/chat/{chatId}/blockings/{blockingId}")
    fun updateChatBlocking(@PathVariable chatId: String,
                           @PathVariable blockingId: String,
                           @RequestBody @Valid updateChatBlockingRequest: UpdateChatBlockingRequest
    ) = chatBlockingService.updateBlocking(chatId, blockingId, updateChatBlockingRequest)

    @PreAuthorize("hasRole('USER')")
    @DeleteMapping("/api/v1/chat/{chatId}/blockings/{blockingId}")
    fun cancelChatBlocking(@PathVariable chatId: String,
                           @PathVariable blockingId: String
    ) = chatBlockingService.unblockUser(chatId, blockingId)
}

