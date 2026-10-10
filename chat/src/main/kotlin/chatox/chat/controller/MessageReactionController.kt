package chatox.chat.controller

import chatox.chat.api.response.MessageReactionResponse
import chatox.chat.service.MessageReactionService
import chatox.platform.pagination.PaginationRequest
import chatox.platform.pagination.annotation.PageSize
import chatox.platform.pagination.annotation.PaginationConfig
import chatox.platform.pagination.annotation.SortBy
import chatox.platform.pagination.annotation.SortDirection
import chatox.platform.security.reactive.annotation.ReactivePermissionCheck
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux

@RestController
@RequestMapping("/api/v1/chats")
class MessageReactionController(private val messageReactionService: MessageReactionService) {

    @PreAuthorize("hasRole('USER') || hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@messageReactionPermissions.canCreateMessageReaction(#chatId, #emojiId)")
    @PostMapping("/{chatId}/messages/{messageId}/reactions/{emojiId}")
    fun addReaction(
        @PathVariable chatId: String,
        @PathVariable messageId: String,
        @PathVariable emojiId: String
    ) = messageReactionService.addReaction(messageId, emojiId)

    @PreAuthorize("hasRole('USER') || hasRole('ANONYMOUS_USER')")
    @DeleteMapping("/{chatId}/messages/{messageId}/reactions/{emojiId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteReaction(
        @PathVariable chatId: String,
        @PathVariable messageId: String,
        @PathVariable emojiId: String
    ) = messageReactionService.deleteReaction(messageId, emojiId)

    @PreAuthorize("hasRole('USER') || hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@messagePermissions.canReadMessages(#chatId)")
    @PaginationConfig(
        pageSize = PageSize(defaultValue = 200, max = 300),
        sortBy = SortBy(defaultValue = "createdAt", allowed = ["createdAt"]),
        sortingDirection = SortDirection(defaultValue = "desc")
    )
    @GetMapping("/{chatId}/messages/{messageId}/reactions")
    fun getReactions(
        @PathVariable chatId: String,
        @PathVariable messageId: String,
        paginationRequest: PaginationRequest
    ): Flux<MessageReactionResponse> = messageReactionService.getReactions(messageId, paginationRequest)

    @PreAuthorize("hasRole('USER') || hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@messagePermissions.canReadMessages(#chatId)")
    @PaginationConfig(
        pageSize = PageSize(defaultValue = 200, max = 300),
        sortBy = SortBy(defaultValue = "createdAt", allowed = ["createdAt"]),
        sortingDirection = SortDirection(defaultValue = "desc")
    )
    @GetMapping("/{chatId}/messages/{messageId}/reactions/{emojiId}")
    fun getReactions(
        @PathVariable chatId: String,
        @PathVariable messageId: String,
        @PathVariable emojiId: String,
        paginationRequest: PaginationRequest
    ): Flux<MessageReactionResponse> = messageReactionService.getReactions(messageId, emojiId, paginationRequest)
}