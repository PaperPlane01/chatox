package chatox.chat.controller

import chatox.chat.api.request.UpdateChatParticipationRequest
import chatox.chat.service.ChatParticipationService
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import javax.validation.Valid

@RestController
class ChatParticipationController(private val chatParticipationService: ChatParticipationService) {

    @PostMapping("/api/v1/chat/{chatId}/join")
    fun joinChat(@PathVariable chatId: String) = chatParticipationService.joinChat(chatId)

    @DeleteMapping("/api/v1/chat/{chatId}/leave")
    fun leaveChat(@PathVariable chatId: String) = chatParticipationService.leaveChat(chatId)

    @DeleteMapping("/api/v1/chat/{chatId}/participants/{participationId}")
    fun kickParticipant(@PathVariable chatId: String,
                        @PathVariable participationId: String
    ) = chatParticipationService.deleteChatParticipation(participationId)

    @PutMapping("/api/v1/chat/{chatId}/participants/{participationId}")
    fun updateChatParticipant(@PathVariable chatId: String,
                              @PathVariable participationId: String,
                              @RequestBody @Valid updateChatParticipationRequest: UpdateChatParticipationRequest
    ) = chatParticipationService.updateChatParticipation(participationId, updateChatParticipationRequest)
}
