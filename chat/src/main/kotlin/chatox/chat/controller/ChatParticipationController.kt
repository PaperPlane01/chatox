package chatox.chat.controller

import chatox.chat.api.request.UpdateChatParticipationRequest
import chatox.chat.service.ChatParticipationService
import chatox.chat.support.pagination.PaginationRequest
import chatox.chat.support.pagination.annotation.PageSize
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
class ChatParticipationController(private val chatParticipationService: ChatParticipationService) {

    @PostMapping("/api/v1/chat/{chatId}/join")
    @PreAuthorize("hasRole('USER')")
    fun joinChat(@PathVariable chatId: String) = chatParticipationService.joinChat(chatId)

    @DeleteMapping("/api/v1/chat/{chatId}/leave")
    @PreAuthorize("hasRole('USER')")
    fun leaveChat(@PathVariable chatId: String) = chatParticipationService.leaveChat(chatId)

    @GetMapping("/api/v1/chat/{chatId}/participants/online")
    fun getOnlineChatParticipants(@PathVariable chatId: String) = chatParticipationService.findOnlineParticipants(chatId)

    @DeleteMapping("/api/v1/chat/{chatId}/participants/{participationId}")
    @PreAuthorize("hasRole('USER')")
    fun kickParticipant(@PathVariable chatId: String,
                        @PathVariable participationId: String
    ) = chatParticipationService.deleteChatParticipation(participationId, chatId)

    @PutMapping("/api/v1/chat/{chatId}/participants/{participationId}")
    @PreAuthorize("hasRole('USER')")
    fun updateChatParticipant(@PathVariable chatId: String,
                              @PathVariable participationId: String,
                              @RequestBody @Valid updateChatParticipationRequest: UpdateChatParticipationRequest
    ) = chatParticipationService.updateChatParticipation(participationId, chatId, updateChatParticipationRequest)

    @PaginationConfig(
            sortBy = SortBy(allowed = ["createdAt"], default = "createdAt"),
            sortingDirection = SortDirection(default = "asc")
    )
    @GetMapping("/api/v1/chat/{chatId}/participants")
    fun getChatParticipants(@PathVariable chatId: String,
                            paginationRequest: PaginationRequest
    ) = chatParticipationService.findParticipantsOfChat(chatId, paginationRequest)
}
