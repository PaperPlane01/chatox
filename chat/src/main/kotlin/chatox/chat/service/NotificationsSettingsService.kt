package chatox.chat.service

import chatox.chat.api.request.UpdateChatNotificationsSettingsRequest
import chatox.chat.api.request.UpdateGlobalNotificationsSettingsRequest
import chatox.chat.api.response.ChatNotificationsSettingsResponse
import chatox.chat.api.response.GlobalNotificationsSettingsResponse
import reactor.core.publisher.Mono

interface NotificationsSettingsService {
    fun getNotificationsSettingsOfCurrentUser(): Mono<GlobalNotificationsSettingsResponse>
    fun updateGlobalNotificationsSettings(updateGlobalNotificationsSettingsRequest: UpdateGlobalNotificationsSettingsRequest): Mono<GlobalNotificationsSettingsResponse>
    fun updateNotificationsSettingsForChat(chatId: String, updateChatNotificationsSettings: UpdateChatNotificationsSettingsRequest): Mono<ChatNotificationsSettingsResponse>
    fun deleteNotificationsSettingsForChat(chatId: String): Mono<Unit>
}