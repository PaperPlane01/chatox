package chatox.chat.mapper

import chatox.chat.api.request.CreateChatRequest
import chatox.chat.api.request.UpdateChatRequest
import chatox.chat.api.response.ChatOfCurrentUserResponse
import chatox.chat.api.response.ChatResponse
import chatox.chat.api.response.MessageResponse
import chatox.chat.messaging.rabbitmq.event.ChatUpdated
import chatox.chat.model.Chat
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatType
import chatox.chat.model.Message
import chatox.chat.model.User
import org.springframework.stereotype.Component
import java.time.ZonedDateTime
import java.util.UUID

@Component
class ChatMapper(
        private val chatParticipationMapper: ChatParticipationMapper,
        private val messageMapper: MessageMapper,
        private val uploadMapper: UploadMapper
) {
    fun toChatResponse(chat: Chat) = ChatResponse(
            id = chat.id,
            description = chat.description,
            name = chat.name,
            slug = chat.slug,
            avatarUri = chat.avatarUri,
            participantsCount = chat.numberOfParticipants,
            createdByCurrentUser = null,
            tags = chat.tags,
            avatar = if (chat.avatar != null) uploadMapper.toUploadResponse(chat.avatar!!) else null
    )

    fun toChatResponse(chat: Chat, currentUserId: String?) = ChatResponse(
            id = chat.id,
            description = chat.description,
            name = chat.name,
            slug = chat.slug,
            avatarUri = chat.avatarUri,
            participantsCount = chat.numberOfParticipants,
            createdByCurrentUser = currentUserId ?: currentUserId === chat.createdBy.id,
            tags = chat.tags,
            avatar = if (chat.avatar != null) uploadMapper.toUploadResponse(chat.avatar!!) else null
    )

    fun toChatOfCurrentUserResponse(
            chat: Chat,
            chatParticipation: ChatParticipation,
            lastMessage: Message?,
            lastReadMessage: Message?,
            unreadMessagesCount: Int,
            onlineParticipantsCount: Int
    ): ChatOfCurrentUserResponse {
        var lastReadMessageMapped: MessageResponse? = null
        var lastMessageMapped: MessageResponse? = null

        if (lastReadMessage != null) {
            lastReadMessageMapped = messageMapper.toMessageResponse(
                    lastReadMessage,
                    readByCurrentUser = true,
                    mapReferredMessage = false
            )
        }

        if (lastMessage != null) {
            lastMessageMapped = messageMapper.toMessageResponse(
                    lastMessage,
                    readByCurrentUser = lastReadMessage ?: lastReadMessage?.id == lastMessage.id,
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
                unreadMessagesCount = unreadMessagesCount,
                createdAt = chat.createdAt,
                description = chat.description,
                tags = chat.tags,
                participantsCount = chat.numberOfParticipants,
                avatar = if (chat.avatar != null) uploadMapper.toUploadResponse(chat.avatar!!) else null,
                createdByCurrentUser = chat.createdBy.id == chatParticipation.user.id
        )
    }

    fun fromCreateChatRequest(createChatRequest: CreateChatRequest, currentUser: User): Chat {
        val id = UUID.randomUUID().toString()
        val createdAt = ZonedDateTime.now()

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
                updatedAt = createdAt,
                deletedBy = null,
                numberOfParticipants = 1,
                lastMessage = null,
                lastMessageDate = createdAt
        )
    }

    fun toChatUpdated(chat: Chat) = ChatUpdated(
            id = chat.id,
            avatar = if (chat.avatar != null) uploadMapper.toUploadResponse(chat.avatar!!) else null,
            description = chat.description,
            avatarUri = chat.avatarUri,
            createdAt = chat.createdAt,
            name = chat.name,
            slug = chat.slug,
            tags = chat.tags
    )
}
