package chatox.chat.mapper

import chatox.chat.api.response.ChatParticipationMinifiedResponse
import chatox.chat.model.ChatParticipation
import org.springframework.stereotype.Component

@Component
class ChatParticipationMapper {

    fun toMinifiedChatParticipationResponse(chatParticipation: ChatParticipation) = ChatParticipationMinifiedResponse(
            id = chatParticipation.id,
            role = chatParticipation.role
    )
}
