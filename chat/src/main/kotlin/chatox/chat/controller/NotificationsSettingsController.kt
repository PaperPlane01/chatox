package chatox.chat.controller

import chatox.chat.api.request.UpdateChatNotificationsSettingsRequest
import chatox.chat.api.request.UpdateGlobalNotificationsSettingsRequest
import chatox.chat.service.NotificationsSettingsService
import jakarta.validation.Valid
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1")
class NotificationsSettingsController(private val notificationsSettingsService: NotificationsSettingsService) {

    @PreAuthorize("hasRole('USER') || hasRole('ANONYMOUS_USER')")
    @GetMapping("/notifications-settings")
    fun getGlobalNotificationsSettings() = notificationsSettingsService.getNotificationsSettingsOfCurrentUser()

    @PreAuthorize("hasRole('USER')")
    @PutMapping("/notifications-settings")
    fun updateGlobalNotificationsSettings(
            @RequestBody @Valid updateGlobalNotificationsSettingsRequest: UpdateGlobalNotificationsSettingsRequest
    ) = notificationsSettingsService.updateGlobalNotificationsSettings(updateGlobalNotificationsSettingsRequest)

    @PreAuthorize("hasRole('USER')")
    @PutMapping("/chats/{chatId}/notifications-settings")
    fun updateChatNotificationsSettings(
            @PathVariable chatId: String,
            @RequestBody @Valid updateChatNotificationsSettingsRequest: UpdateChatNotificationsSettingsRequest
    ) = notificationsSettingsService.updateNotificationsSettingsForChat(chatId, updateChatNotificationsSettingsRequest)

    @PreAuthorize("hasRole('USER')")
    @DeleteMapping("/chats/{chatId}/notifications-settings")
    fun deleteChatNotificationsSettings(
            @PathVariable chatId: String
    ) = notificationsSettingsService.deleteNotificationsSettingsForChat(chatId)
}