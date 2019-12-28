package chatox.chat.mapper

import chatox.chat.api.request.CreateChatRequest
import chatox.chat.api.request.UpdateChatRequest
import chatox.chat.api.response.ChatOfCurrentUserResponse
import chatox.chat.api.response.ChatResponse
import chatox.chat.api.response.MessageResponse
import chatox.chat.model.Chat
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatType
import chatox.chat.model.Message
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
    fun toChatResponse(chat: Chat) = ChatResponse(
            id = chat.id,
            description = chat.description,
            name = chat.name,
            slug = chat.slug,
            avatarUri = chat.avatarUri,
            numberOfParticipants = chat.numberOfParticipants,
            createdByCurrentUser = null,
            tags = chat.tags
    )

    fun toChatResponse(chat: Chat, currentUserId: String?) = ChatResponse(
            id = chat.id,
            description = chat.description,
            name = chat.name,
            slug = chat.slug,
            avatarUri = chat.avatarUri,
            numberOfParticipants = chat.numberOfParticipants,
            createdByCurrentUser = currentUserId ?: currentUserId === chat.createdBy.id,
            tags = chat.tags
    )

    fun toChatOfCurrentUserResponse(chat: Chat, chatParticipation: ChatParticipation, lastMessage: Message?, lastReadMessage: Message?, unreadMessagesCount: Int): ChatOfCurrentUserResponse {
        var lastReadMessageMapped: MessageResponse? = null
        var lastMessageMapped: MessageResponse? = null

        if (lastReadMessage != null) {
            lastReadMessageMapped = messageMapper.toMessageResponse(
                    lastReadMessage,
                    readByCurrentUser = true,
                    mapReferredMessage = false
            )
        }

        if (lastReadMessage != null) {
            lastMessageMapped = messageMapper.toMessageResponse(
                    lastReadMessage,
                    readByCurrentUser = lastReadMessage.id == lastMessage?.id,
                    mapReferredMessage = false
            )
        }

        return ChatOfCurrentUserResponse(
                id = chat.id,
                name = chat.name,
                slug = chat.slug,
                avatarUri = chat.avatarUri,
                lastReadMessage = lastReadMessageMapped,
                lastMessage = lastMessageMapped,
                chatParticipation = chatParticipationMapper.toMinifiedChatParticipationResponse(chatParticipation),
                unreadMessagesCount = unreadMessagesCount
        )
    }

    fun fromCreateChatRequest(createChatRequest: CreateChatRequest, currentUser: User): Chat {
        val id = UUID.randomUUID().toString()
        val createdAt = Date.from(Instant.now())

        return Chat(
                id = id,
                slug = createChatRequest.slug ?: id,
                name = createChatRequest.name,
                createdAt = createdAt,
                type = ChatType.GROUP,
                deleted = false,
                createdBy = currentUser,
                tags = createChatRequest.tags,
                avatarUri = null,
                deletedAt = null,
                description = createChatRequest.description,
                updatedAt = null,
                deletedBy = null,
                numberOfParticipants = 1,
                lastMessage = null,
                lastMessageDate = createdAt
        )
    }
    
    fun mapChatUpdate(updateChatRequest: UpdateChatRequest, originalChat: Chat) = originalChat.copy(
            name = updateChatRequest.name ?: originalChat.name,
            avatarUri = updateChatRequest.avatarUri,
            slug = updateChatRequest.slug ?: originalChat.id,
            description = updateChatRequest.description,
            tags = updateChatRequest.tags ?: originalChat.tags
    )
}
