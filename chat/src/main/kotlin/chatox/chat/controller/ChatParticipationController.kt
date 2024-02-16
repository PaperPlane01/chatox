package chatox.chat.controller

import chatox.chat.api.request.PendingChatParticipantsRequest
import chatox.chat.api.request.UpdateChatParticipationRequest
import chatox.chat.service.ChatParticipationService
import chatox.platform.pagination.PaginationRequest
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
class ChatParticipationController(private val chatParticipationService: ChatParticipationService) {

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatParticipationPermissions.canJoinChat(#chatId)")
    @PostMapping("/{chatId}/join")
    fun joinChat(
            @PathVariable chatId: String,
            @RequestParam(required = false) inviteId: String?
    ) = chatParticipationService.joinChat(chatId, inviteId)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatParticipationPermissions.canLeaveChat(#chatId)")
    @DeleteMapping("/{chatId}/leave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun leaveChat(@PathVariable chatId: String) = chatParticipationService.leaveChat(chatId)

    @GetMapping("/{chatId}/participants/online")
    fun getOnlineChatParticipants(@PathVariable chatId: String) = chatParticipationService.findOnlineParticipants(chatId)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatParticipationPermissions.canKickChatParticipant(#chatId, #participationId)")
    @DeleteMapping("/{chatId}/participants/{participationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun kickParticipant(@PathVariable chatId: String,
                        @PathVariable participationId: String
    ) = chatParticipationService.deleteChatParticipation(participationId, chatId)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatParticipationPermissions.canUpdateChatParticipant(#chatId, #participationId, #updateChatParticipationRequest)")
    @PutMapping("/{chatId}/participants/{participationId}")
    fun updateChatParticipant(@PathVariable chatId: String,
                              @PathVariable participationId: String,
                              @RequestBody @Valid updateChatParticipationRequest: UpdateChatParticipationRequest
    ) = chatParticipationService.updateChatParticipation(participationId, chatId, updateChatParticipationRequest)

    @PaginationConfig(
            sortBy = SortBy(allowed = ["createdAt", "userOnline", "userDisplayedName"], defaultValue = "userOnline"),
            sortingDirection = SortDirection(defaultValue = "desc")
    )
    @GetMapping("/{chatId}/participants")
    fun getChatParticipants(@PathVariable chatId: String,
                            paginationRequest: PaginationRequest
    ) = chatParticipationService.findParticipantsOfChat(chatId, paginationRequest)

    @PaginationConfig(
            sortBy = SortBy(allowed = ["createdAt", "userOnline", "userDisplayedName"], defaultValue = "userOnline"),
            sortingDirection = SortDirection(defaultValue = "desc")
    )
    @GetMapping(value = ["/{chatId}/participants"], params = ["roleId"])
    fun getChatParticipantsWithRole(@PathVariable("chatId") chatId: String,
                                    @RequestParam(value = "roleId", required = true) roleId: String,
                                    paginationRequest: PaginationRequest
    ) = chatParticipationService.findParticipantsWithRole(chatId, roleId, paginationRequest)

    @PaginationConfig(
            sortBy = SortBy(allowed = ["createdAt", "userOnline", "userDisplayedName"], defaultValue = "userOnline"),
            sortingDirection = SortDirection(defaultValue = "desc")
    )
    @GetMapping("/{chatId}/participants/search")
    fun searchChatParticipants(@PathVariable chatId: String,
                               @RequestParam query: String = "",
                               paginationRequest: PaginationRequest
    ) = chatParticipationService.searchChatParticipants(chatId, query, paginationRequest)


    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatParticipationPermissions.canApproveChatParticipants(#chatId)")
    @PaginationConfig(
            sortBy = SortBy(allowed = ["createdAt"], defaultValue = "createdAt"),
            sortingDirection = SortDirection(defaultValue = "desc", allowed = ["desc"])
    )
    @GetMapping("/{chatId}/participants/pending")
    fun getPendingChatParticipants(
            @PathVariable chatId: String,
            paginationRequest: PaginationRequest
    ) = chatParticipationService.findPendingChatParticipations(chatId, paginationRequest)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatParticipationPermissions.canApproveChatParticipants(#chatId)")
    @PutMapping("/{chatId}/participants/pending/approve")
    fun approvePendingChatParticipants(
            @PathVariable chatId: String,
            @RequestBody @Valid pendingChatParticipantsRequest: PendingChatParticipantsRequest
    ) = chatParticipationService.approveChatParticipants(chatId, pendingChatParticipantsRequest)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@chatParticipationPermissions.canApproveChatParticipants(#chatId)")
    @DeleteMapping("/{chatId}/participants/pending/reject")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun rejectPendingChatParticipants(
            @PathVariable chatId: String,
            @RequestBody @Valid pendingChatParticipantsRequest: PendingChatParticipantsRequest
    ) = chatParticipationService.rejectChatParticipants(chatId, pendingChatParticipantsRequest)
}
