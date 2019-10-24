package chatox.chat.mapper

import chatox.chat.api.response.MessageResponse
import chatox.chat.model.Message
import org.springframework.stereotype.Component

@Component
class MessageMapper(private val userMapper: UserMapper) {
    fun toMessageResponse(message: Message, mapReferredMessage: Boolean, readByCurrentUser: Boolean): MessageResponse {
        var referredMessage: MessageResponse? = null

        if (message.referredMessage != null) {
            referredMessage = toMessageResponse(message.referredMessage!!, false, readByCurrentUser);
        }

        return MessageResponse(
                id = message.id,
                deleted = message.deleted,
                createdAt = message.createdAt,
                sender = userMapper.toUserResponse(message.sender),
                text = message.text,
                readByCurrentUser = readByCurrentUser,
                referredMessage = referredMessage,
                updatedAt = message.updatedAt
        )
    }
}
