package chatox.chat.test

import chatox.chat.api.response.MessageResponse
import chatox.chat.messaging.rabbitmq.event.MessageCreated
import chatox.chat.model.Chat
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatUploadAttachment
import chatox.chat.model.EmojiInfo
import chatox.chat.model.Message
import chatox.chat.model.ScheduledMessage
import chatox.chat.model.Sticker
import chatox.chat.model.Upload
import chatox.platform.security.jwt.JwtPayload
import chatox.platform.util.JsonLoader.loadResource

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

    fun sticker() = loadResource(
            "model/sticker.json",
            Sticker::class.java
    ) as Sticker<Any>

    fun message(): Message = loadResource(
            "model/message.json",
            Message::class.java
    )

    fun upload() = loadResource(
            "model/upload.json",
            Upload::class.java
    ) as Upload<Any>

    fun chatUploadAttachment() = loadResource(
            "model/chat-upload-attachment.json",
            ChatUploadAttachment::class.java
    ) as ChatUploadAttachment<Any>

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
}