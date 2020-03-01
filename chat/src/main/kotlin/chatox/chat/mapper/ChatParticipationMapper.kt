package chatox.chat.mapper

import chatox.chat.api.request.UpdateChatParticipationRequest
import chatox.chat.api.response.ChatParticipationMinifiedResponse
import chatox.chat.api.response.ChatParticipationResponse
import chatox.chat.model.Chat
import chatox.chat.model.ChatParticipation
import org.springframework.stereotype.Component

@Component
class ChatParticipationMapper(private val userMapper: UserMapper) {
    fun toMinifiedChatParticipationResponse(chatParticipation: ChatParticipation) = ChatParticipationMinifiedResponse(
            id = chatParticipation.id,
            role = chatParticipation.role
    )

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
