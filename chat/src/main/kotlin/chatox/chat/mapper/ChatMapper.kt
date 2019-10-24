package chatox.chat.mapper

import chatox.chat.api.request.CreateChatRequest
import chatox.chat.api.response.ChatOfCurrentUserResponse
import chatox.chat.api.response.ChatResponse
import chatox.chat.api.response.MessageResponse
import chatox.chat.model.Chat
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatType
import chatox.chat.model.User
import org.springframework.stereotype.Component
import java.time.Instant
import java.util.Date
import java.util.UUID

@Component
class ChatMapper(
        private val chatParticipationMapper: ChatParticipationMapper,
        private val messageMapper: MessageMapper
) {
    fun toChatResponse(chat: Chat, numberOfParticipants: Int, currentUserId: String) = ChatResponse(
            id = chat.id,
            description = chat.description,
            name = chat.name,
            slug = chat.slug,
            avatarUri = chat.avatarUri,
            numberOfParticipants = numberOfParticipants,
            createdByCurrentUser = currentUserId === chat.createdBy.id,
            tags = chat.tags
    )

    fun toChatOfCurrentUserResponse(chat: Chat, chatParticipation: ChatParticipation, unreadMessagesCount: Int): ChatOfCurrentUserResponse {
        var lastReadMessage: MessageResponse? = null;

        if (chatParticipation.lastReadMessage != null) {
            lastReadMessage = messageMapper.toMessageResponse(
                    chatParticipation.lastReadMessage!!,
                    mapReferredMessage = false,
                    readByCurrentUser = true
            )
        }

        return ChatOfCurrentUserResponse(
                id = chat.id,
                name = chat.name,
                slug = chat.slug,
                avatarUri = chat.avatarUri,
                lastReadMessage = lastReadMessage,
                chatParticipation = chatParticipationMapper.toMinifiedChatParticipationResponse(chatParticipation),
                unreadMessagesCount = unreadMessagesCount
        )
    }

    fun fromCreateChatRequest(createChatRequest: CreateChatRequest, currentUser: User): Chat {
        val id = UUID.randomUUID().toString()

        return Chat(
                id = id,
                slug = createChatRequest.slug ?: id,
                name = createChatRequest.name,
                createdAt = Date.from(Instant.now()),
                type = ChatType.GROUP,
                deleted = false,
                createdBy = currentUser,
                tags = arrayListOf(),
                avatarUri = null,
                deletedAt = null,
                description = createChatRequest.description,
                updatedAt = null,
                deletedBy = null
        )
    }
}
