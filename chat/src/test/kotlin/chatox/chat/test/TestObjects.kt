package chatox.chat.test

import chatox.chat.api.response.ChatOfCurrentUserResponse
import chatox.chat.api.response.ChatParticipationResponse
import chatox.chat.api.response.ChatResponse
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
import chatox.chat.model.EmojiInfo
import chatox.chat.model.Message
import chatox.chat.model.PendingChatParticipation
import chatox.chat.model.ScheduledMessage
import chatox.chat.model.Sticker
import chatox.chat.model.Upload
import chatox.chat.model.User
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

    fun emojiInfo(): EmojiInfo = loadResource(
            "model/emoji.json",
            EmojiInfo::class.java
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
}