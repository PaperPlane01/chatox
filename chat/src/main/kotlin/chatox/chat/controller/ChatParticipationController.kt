package chatox.chat.controller

import chatox.chat.api.request.UpdateChatParticipationRequest
import chatox.chat.service.ChatParticipationService
import chatox.chat.support.pagination.PaginationRequest
import chatox.chat.support.pagination.annotation.PageSize
import chatox.chat.support.pagination.annotation.PaginationConfig
import chatox.chat.support.pagination.annotation.SortBy
import chatox.chat.support.pagination.annotation.SortDirection
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
import javax.validation.Valid

@RestController
@RequestMapping("/api/v1/chats")
class ChatParticipationController(private val chatParticipationService: ChatParticipationService) {

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    @PostMapping("/{chatId}/join")
    fun joinChat(@PathVariable chatId: String) = chatParticipationService.joinChat(chatId)

    @PreAuthorize("hasRole('USER') or hasRole('ANONYMOUS_USER')")
    @DeleteMapping("/{chatId}/leave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun leaveChat(@PathVariable chatId: String) = chatParticipationService.leaveChat(chatId)

    @GetMapping("/{chatId}/participants/online")
    fun getOnlineChatParticipants(@PathVariable chatId: String) = chatParticipationService.findOnlineParticipants(chatId)

    @PreAuthorize("hasRole('USER')")
    @DeleteMapping("/{chatId}/participants/{participationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun kickParticipant(@PathVariable chatId: String,
                        @PathVariable participationId: String
    ) = chatParticipationService.deleteChatParticipation(participationId, chatId)

    @PreAuthorize("hasRole('USER')")
    @PutMapping("/{participationId}")
    fun updateChatParticipant(@PathVariable chatId: String,
                              @PathVariable participationId: String,
                              @RequestBody @Valid updateChatParticipationRequest: UpdateChatParticipationRequest
    ) = chatParticipationService.updateChatParticipation(participationId, chatId, updateChatParticipationRequest)

    @PaginationConfig(
            sortBy = SortBy(allowed = ["createdAt"], default = "createdAt"),
            sortingDirection = SortDirection(default = "asc")
    )
    @GetMapping("/{chatId}/participants")
    fun getChatParticipants(@PathVariable chatId: String,
                            paginationRequest: PaginationRequest
    ) = chatParticipationService.findParticipantsOfChat(chatId, paginationRequest)

    @PaginationConfig(
            sortBy = SortBy(allowed = ["userDisplayedName", "createdAt"], default = "userDisplayedName"),
            sortingDirection = SortDirection(default = "asc")
    )
    @GetMapping("/{chatId}/participants/search")
    fun searchChatParticipants(@PathVariable chatId: String,
                               @RequestParam query: String = "",
                               paginationRequest: PaginationRequest
    ) = chatParticipationService.searchChatParticipants(chatId, query, paginationRequest)
}
