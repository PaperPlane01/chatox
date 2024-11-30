package chatox.chat.test

import chatox.chat.api.request.UpdateChatNotificationsSettingsRequest
import chatox.chat.api.request.UpdateGlobalNotificationsSettingsRequest
import chatox.chat.api.response.ChatNotificationsSettingsResponse
import chatox.chat.api.response.ChatOfCurrentUserResponse
import chatox.chat.api.response.ChatParticipationResponse
import chatox.chat.api.response.ChatResponse
import chatox.chat.api.response.GlobalNotificationsSettingsResponse
import chatox.chat.api.response.MessageResponse
import chatox.chat.messaging.rabbitmq.event.ChatUpdated
import chatox.chat.messaging.rabbitmq.event.MessageCreated
import chatox.chat.model.Chat
import chatox.chat.model.ChatInvite
import chatox.chat.model.ChatMessagesCounter
import chatox.chat.model.ChatParticipantsCount
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatRole
import chatox.chat.model.ChatUploadAttachment
import chatox.chat.model.DialogParticipant
import chatox.chat.model.DraftMessage
import chatox.chat.model.Message
import chatox.chat.model.PendingChatParticipation
import chatox.chat.model.ScheduledMessage
import chatox.chat.model.Sticker
import chatox.chat.model.TextInfo
import chatox.chat.model.UnreadMessagesCount
import chatox.chat.model.Upload
import chatox.chat.model.User
import chatox.chat.model.UserGlobalNotificationsSettings
import chatox.platform.security.jwt.JwtPayload
import chatox.platform.util.JsonLoader.loadResource
import com.fasterxml.jackson.core.type.TypeReference

object TestObjects {

    fun jwtPayload(): JwtPayload = loadResource(
            "jwt/jwt-payload.json",
            JwtPayload::class.java
    )

    fun chat(): Chat = loadResource(
            "model/chat.json",
            Chat::class.java
    )

    fun chatParticipation(): ChatParticipation = loadResource(
            "model/chat-participation.json",
            ChatParticipation::class.java
    )

    fun chatParticipationResponse(): ChatParticipationResponse = loadResource(
            "responses/chat-participation-response.json",
            ChatParticipationResponse::class.java
    )

    fun sticker(): Sticker<Any> = loadResource(
            "model/sticker.json",
            object : TypeReference<Sticker<Any>>() {}
    )

    fun message(): Message = loadResource(
            "model/message.json",
            Message::class.java
    )

    fun upload(): Upload<Any> = loadResource(
            "model/upload.json",
            object : TypeReference<Upload<Any>>() {}
    )

    fun chatUploadAttachment(): ChatUploadAttachment<Any> = loadResource(
            "model/chat-upload-attachment.json",
            object : TypeReference<ChatUploadAttachment<Any>>() {}
    )

    fun textInfo(): TextInfo = loadResource(
            "model/text-info.json",
            TextInfo::class.java
    )

    fun unreadMessagesCount(): UnreadMessagesCount = loadResource(
            "model/unread-messages-count.json",
            UnreadMessagesCount::class.java
    )

    fun messageResponse(): MessageResponse = loadResource(
            "responses/message-response.json",
            MessageResponse::class.java
    )

    fun messageCreated(): MessageCreated = loadResource(
            "events/message-created.json",
            MessageCreated::class.java
    )

    fun scheduledMessage(): ScheduledMessage = loadResource(
            "model/scheduled-message.json",
            ScheduledMessage::class.java
    )

    fun draftMessage(): DraftMessage = loadResource(
            "model/draft-message.json",
            DraftMessage::class.java
    )

    fun user(): User = loadResource(
            "model/user.json",
            User::class.java
    )

    fun chatRole(): ChatRole = loadResource(
            "model/chat-role.json",
            ChatRole::class.java
    )

    fun chatRoles(): List<ChatRole> = loadResource(
            "model/chat-roles.json",
            object : TypeReference<List<ChatRole>>() {}
    )

    fun chatMessagesCounter(): ChatMessagesCounter = loadResource(
            "model/chat-messages-counter.json",
            ChatMessagesCounter::class.java
    )

    fun chatOfCurrentUser(): ChatOfCurrentUserResponse = loadResource(
            "responses/chat-of-current-user-response.json",
            ChatOfCurrentUserResponse::class.java
    )

    fun chatResponse(): ChatResponse = loadResource(
            "responses/chat-response.json",
            ChatResponse::class.java
    )

    fun chatUpdated(): ChatUpdated = loadResource(
            "events/chat-updated.json",
            ChatUpdated::class.java
    )

    fun dialogParticipant(): DialogParticipant = loadResource(
            "model/dialog-participant.json",
            DialogParticipant::class.java
    )

    fun chatInvite(): ChatInvite = loadResource(
            "model/chat-invite.json",
            ChatInvite::class.java
    )

    fun pendingChatParticipation(): PendingChatParticipation = loadResource(
            "model/pending-chat-participation.json",
            PendingChatParticipation::class.java
    )

    fun chatParticipantsCount(): ChatParticipantsCount = loadResource(
            "model/chat-participants-count.json",
            ChatParticipantsCount::class.java
    )

    fun userGlobalNotificationsSettings(): UserGlobalNotificationsSettings = loadResource(
            "model/user-global-notifications-settings.json",
            UserGlobalNotificationsSettings::class.java
    )

    fun globalNotificationsSettingsResponse(): GlobalNotificationsSettingsResponse = loadResource(
            "responses/global-notifications-settings-response.json",
            GlobalNotificationsSettingsResponse::class.java
    )

    fun updateGlobalNotificationsSettingsRequest(): UpdateGlobalNotificationsSettingsRequest = loadResource(
            "requests/update-global-notifications-settings-request.json",
            UpdateGlobalNotificationsSettingsRequest::class.java
    )

    fun chatNotificationsSettingsResponse(): ChatNotificationsSettingsResponse = loadResource(
            "responses/chat-notifications-settings-response.json",
            ChatNotificationsSettingsResponse::class.java
    )

    fun updateChatNotificationsSettingsRequest(): UpdateChatNotificationsSettingsRequest = loadResource(
            "requests/update-chat-notifications-settings-request.json",
            UpdateChatNotificationsSettingsRequest::class.java
    )
}