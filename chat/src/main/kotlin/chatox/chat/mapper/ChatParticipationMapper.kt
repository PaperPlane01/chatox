package chatox.chat.mapper

import chatox.chat.api.request.UpdateChatParticipationRequest
import chatox.chat.api.response.ChatBlockingResponse
import chatox.chat.api.response.ChatParticipationMinifiedResponse
import chatox.chat.api.response.ChatParticipationResponse
import chatox.chat.model.Chat
import chatox.chat.model.ChatBlocking
import chatox.chat.model.ChatParticipation
import org.springframework.stereotype.Component
import java.time.ZonedDateTime

@Component
class ChatParticipationMapper(private val userMapper: UserMapper,
                              private val chatBlockingMapper: ChatBlockingMapper) {

    fun toMinifiedChatParticipationResponse(chatParticipation: ChatParticipation): ChatParticipationMinifiedResponse {
        var activeChatBlocking: ChatBlockingResponse? = null
        val lastChatBlocking = chatParticipation.lastChatBlocking

        if (lastChatBlocking != null && !lastChatBlocking.canceled
                && lastChatBlocking.blockedUntil.isAfter(ZonedDateTime.now())) {
            activeChatBlocking = chatBlockingMapper.toChatBlockingResponse(lastChatBlocking)
        }

        return ChatParticipationMinifiedResponse(
                id = chatParticipation.id,
                role = chatParticipation.role,
                activeChatBlocking = activeChatBlocking
        )
    }

    fun toChatParticipationResponse(chatParticipation: ChatParticipation) = ChatParticipationResponse(
            id = chatParticipation.id,
            user = userMapper.toUserResponse(chatParticipation.user),
            role = chatParticipation.role,
            chatId = chatParticipation.chat.id
    )

    fun mapChatParticipationUpdate(updateChatParticipationRequest: UpdateChatParticipationRequest,
                                   originalChatParticipation: ChatParticipation
    ) = originalChatParticipation.copy(
            role = updateChatParticipationRequest.chatRole
    )
}
