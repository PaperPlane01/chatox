package chatox.chat.mapper

import chatox.chat.api.response.MessageReactionResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.messaging.rabbitmq.event.MessageReactionAdded
import chatox.chat.messaging.rabbitmq.event.MessageReactionDeleted
import chatox.chat.model.MessageReaction
import chatox.chat.model.User
import chatox.platform.text.api.response.EmojiData
import org.springframework.stereotype.Component

@Component
class MessageReactionMapper(private val userMapper: UserMapper) {

    fun toMessageReactionResponse(reaction: MessageReaction, users: Map<String, User>) = MessageReactionResponse(
        id = reaction.id,
        user = users.getValue(reaction.userId).let(userMapper::toUserResponse),
        createdAt = reaction.createdAt,
        emojiId = reaction.emojiId,
        messageId = reaction.messageId
    )

    fun toMessageReactionResponseWithUsersCache(
        reaction: MessageReaction,
        users: Map<String, UserResponse>
    ) = MessageReactionResponse(
        id = reaction.id,
        user = users.getValue(reaction.userId),
        createdAt = reaction.createdAt,
        emojiId = reaction.emojiId,
        messageId = reaction.messageId
    )

    fun toMessageReactionAdded(reaction: MessageReactionResponse, emoji: EmojiData, messageId: String, chatId: String) = MessageReactionAdded(
        id = reaction.id,
        createdAt = reaction.createdAt,
        emojiId = reaction.emojiId,
        emoji = emoji,
        messageId = messageId,
        chatId = chatId,
        user = reaction.user
    )

    fun toMessageReactionDeleted(reaction: MessageReaction, chatId: String) = MessageReactionDeleted(
        id = reaction.id,
        emojiId = reaction.emojiId,
        messageId = reaction.messageId,
        chatId = chatId,
        userId = reaction.userId
    )
}
