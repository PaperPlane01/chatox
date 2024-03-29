package chatox.chat.controller

import chatox.chat.api.request.CreateMessageRequest
import chatox.chat.api.request.ForwardMessagesRequest
import chatox.chat.api.request.UpdateMessageRequest
import chatox.chat.service.CreateMessageService
import chatox.chat.service.MessageSearchService
import chatox.chat.service.MessageService
import chatox.chat.service.ScheduledMessageService
import chatox.chat.service.MessageReadService
import chatox.platform.pagination.PaginationRequest
import chatox.platform.pagination.annotation.PageSize
import chatox.platform.pagination.annotation.PaginationConfig
import chatox.platform.pagination.annotation.SortBy
import chatox.platform.pagination.annotation.SortDirection
import chatox.platform.security.reactive.annotation.ReactivePermissionCheck
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/chats")
class ChatMessageController(
        private val messageService: MessageService,
        private val createMessageService: CreateMessageService,
        private val messageSearchService: MessageSearchService,
        private val scheduledMessageService: ScheduledMessageService,
        private val unreadMessagesCountService: MessageReadService) {

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@messagePermissions.canCreateMessage(#chatId, #createMessageRequest)")
    @PostMapping("/{chatId}/messages")
    fun createMessage(@PathVariable chatId: String,
                      @RequestBody @Valid createMessageRequest: CreateMessageRequest
    ) = createMessageService.createMessage(chatId, createMessageRequest)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@messagePermissions.canUpdateMessage(#messageId, #chatId)")
    @PutMapping("/{chatId}/messages/{messageId}")
    fun updateMessage(@PathVariable chatId: String,
                      @PathVariable messageId: String,
                      @RequestBody @Valid updateMessageRequest: UpdateMessageRequest
    ) = messageService.updateMessage(messageId, chatId,updateMessageRequest)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@messagePermissions.canCreateMessage(#chatId)")
    @PostMapping("/{chatId}/messages/forward")
    fun forwardMessages(@PathVariable chatId: String,
                        @RequestBody @Valid forwardMessagesRequest: ForwardMessagesRequest
    ) = createMessageService.forwardMessages(chatId, forwardMessagesRequest)

    //language=SpEL
    @ReactivePermissionCheck("@messagePermissions.canReadMessages(#chatId)")
    @GetMapping("/{chatId}/messages/pinned")
    fun findPinnedMessageByChat(@PathVariable chatId: String) = messageService.findPinnedMessageByChat(chatId)

    //language=SpEL
    @ReactivePermissionCheck("@messagePermissions.canReadMessages(#chatId)")
    @GetMapping("/{chatId}/messages/{messageId}")
    fun findMessageByChatIdAndMessageId(@PathVariable chatId: String,
                                        @PathVariable messageId: String
    ) = messageService.findMessageByIdAndChatId(messageId, chatId)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@messagePermissions.canDeleteMessage(#messageId, #chatId)")
    @DeleteMapping("/{chatId}/messages/{messageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteMessage(@PathVariable chatId: String,
                      @PathVariable messageId: String
    ) = messageService.deleteMessage(messageId, chatId)

    //language=SpEL
    @ReactivePermissionCheck("@messagePermissions.canReadMessages(#chatId)")
    @PaginationConfig(
            pageSize = PageSize(defaultValue = 200, max = 300),
            sortBy = SortBy(defaultValue = "createdAt", allowed = ["createdAt"]),
            sortingDirection = SortDirection(defaultValue = "desc")
    )
    @GetMapping("/{chatId}/messages")
    fun findMessagesByChat(@PathVariable chatId: String,
                           paginationRequest: PaginationRequest
    ) = messageService.findMessagesByChat(chatId, paginationRequest)

    //language=SpEL
    @ReactivePermissionCheck("@messagePermissions.canReadMessages(#chatId)")
    @PaginationConfig(
            pageSize = PageSize(defaultValue = 200, max = 300),
            sortBy = SortBy(defaultValue = "createdAt", allowed = ["createdAt"])
    )
    @GetMapping("/{chatId}/messages", params = ["beforeId"])
    fun findMessagesByChatBeforeMessage(
            @PathVariable chatId: String,
            @RequestParam beforeId: String,
            paginationRequest: PaginationRequest
    ) = messageService.findMessagesBeforeMessageByChat(chatId, beforeId, paginationRequest)

    //language=SpEL
    @ReactivePermissionCheck("@messagePermissions.canReadMessages(#chatId)")
    @PaginationConfig(
            pageSize = PageSize(defaultValue = 200, max = 300),
            sortBy = SortBy(defaultValue = "createdAt", allowed = ["createdAt"])
    )
    @GetMapping("/{chatId}/messages", params = ["afterId"])
    fun findMessagesByChatAfterMessage(
            @PathVariable chatId: String,
            @RequestParam afterId: String,
            paginationRequest: PaginationRequest
    ) = messageService.findMessagesSinceMessageByChat(chatId, afterId, paginationRequest)

    //language=SpEL
    @ReactivePermissionCheck("@messagePermissions.canReadMessages(#chatId)")
    //language=Kotlin
    @PaginationConfig(
            pageSize = PageSize(defaultValue = 200, max = 300),
            sortBy = SortBy(defaultValue = "createdAt", allowed = ["createdAt"]),
            sortingDirection = SortDirection(defaultValue = "desc")
    )
    @GetMapping("/{chatId}/messages", params = ["query"])
    fun searchMessages(@PathVariable chatId: String,
                       @RequestParam query: String,
                       paginationRequest: PaginationRequest
    ) = messageSearchService.searchMessages(query, chatId, paginationRequest)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    @PaginationConfig(
            pageSize = PageSize(defaultValue = 200, max = 300),
            sortBy = SortBy(defaultValue = "createdAt", allowed = ["createdAt"])
    )
    @GetMapping("/my/messages", params = ["query"])
    fun searchMessagesInChatsOfCurrentUser(@RequestParam query: String,
                                           paginationRequest: PaginationRequest
    ) = messageSearchService.searchMessagesInChatsOfCurrentUser(query, paginationRequest)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@messagePermissions.canSeeScheduledMessages(#chatId)")
    @GetMapping("/{chatId}/messages/scheduled")
    fun findScheduledMessagesBuChat(@PathVariable("chatId") chatId: String) = scheduledMessageService.findScheduledMessagesByChat(chatId)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@messagePermissions.canDeleteScheduledMessage(#messageId, #chatId)")
    @DeleteMapping("/{chatId}/messages/scheduled/{messageId}")
    fun deleteScheduledMessage(@PathVariable chatId: String,
                               @PathVariable messageId: String
    ) = scheduledMessageService.deleteScheduledMessage(chatId, messageId)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@messagePermissions.canUpdateScheduledMessage(#messageId, #chatId)")
    @PutMapping("/{chatId}/messages/scheduled/{messageId}")
    fun updateScheduledMessage(@PathVariable chatId: String,
                               @PathVariable messageId: String,
                               @RequestBody updateMessageRequest: UpdateMessageRequest
    ) = scheduledMessageService.updateScheduledMessage(chatId, messageId, updateMessageRequest)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@messagePermissions.canPublishScheduledMessage(#chatId)")
    @PostMapping("/{chatId}/messages/scheduled/{messageId}/publish")
    fun publishScheduledMessage(@PathVariable chatId: String,
                                @PathVariable messageId: String
    ) = scheduledMessageService.publishScheduledMessage(chatId, messageId)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@messagePermissions.canReadMessages(#chatId)")
    @PostMapping("/{chatId}/messages/all/read")
    fun markAllMessagesAsRead(
            @PathVariable chatId: String
    ) = unreadMessagesCountService.readAllMessagesForCurrentUser(chatId)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@messagePermissions.canReadMessages(#chatId)")
    @PostMapping("/{chatId}/messages/{messageId}/read")
    fun markMessageRead(@PathVariable chatId: String,
                        @PathVariable messageId: String
    ) = unreadMessagesCountService.readMessageForCurrentUser(chatId, messageId)

    @PreAuthorize("hasRole('USER')")
    //language=SpEL
    @ReactivePermissionCheck("@messagePermissions.canPinMessage(#messageId, #chatId)")
    @PostMapping("/{chatId}/messages/{messageId}/pin")
    fun pinMessage(@PathVariable chatId: String,
                   @PathVariable messageId: String
    ) = messageService.pinMessage(messageId, chatId)

    @PreAuthorize("hasRole('USER')")
    //language=SpEL
    @ReactivePermissionCheck("@messagePermissions.canUnpinMessage(#messageId, #chatId)")
    @DeleteMapping("/{chatId}/messages/{messageId}/unpin")
    fun unpinMessage(@PathVariable chatId: String,
                     @PathVariable messageId: String
    ) = messageService.unpinMessage(messageId, chatId)
}
