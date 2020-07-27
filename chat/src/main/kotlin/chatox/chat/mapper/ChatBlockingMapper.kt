package chatox.chat.mapper

import chatox.chat.api.request.CreateChatBlockingRequest
import chatox.chat.api.request.UpdateChatBlockingRequest
import chatox.chat.api.response.ChatBlockingResponse
import chatox.chat.model.Chat
import chatox.chat.model.ChatBlocking
import chatox.chat.model.User
import org.springframework.stereotype.Component
import java.time.ZonedDateTime
import java.util.UUID

@Component
class ChatBlockingMapper(private val userMapper: UserMapper) {

    fun toChatBlockingResponse(chatBlocking: ChatBlocking): ChatBlockingResponse {
        return ChatBlockingResponse(
                id = chatBlocking.id,
                blockedBy = userMapper.toUserResponse(chatBlocking.blockedBy),
                blockedUser = userMapper.toUserResponse(chatBlocking.blockedUser),
                blockedUntil = chatBlocking.blockedUntil,
                description = chatBlocking.description,
                canceled = chatBlocking.canceled,
                canceledBy = if (chatBlocking.canceledBy != null) userMapper.toUserResponse(chatBlocking.canceledBy!!) else null,
                canceledAt = chatBlocking.canceledAt,
                lastModifiedAt = chatBlocking.lastModifiedAt,
                lastModifiedBy = if (chatBlocking.lastModifiedBy != null) userMapper.toUserResponse(chatBlocking.lastModifiedBy!!) else null,
                chatId = chatBlocking.chat.id,
                createdAt = chatBlocking.createdAt
        )
    }

    fun fromCreateChatBlockingRequest(createChatBlockingRequest: CreateChatBlockingRequest,
                                      chat: Chat,
                                      blockedUser: User,
                                      currentUser: User): ChatBlocking {
        return ChatBlocking(
                id = UUID.randomUUID().toString(),
                blockedBy = currentUser,
                createdAt = ZonedDateTime.now(),
                blockedUntil = createChatBlockingRequest.blockedUntil,
                blockedUser = blockedUser,
                chat = chat,
                description = createChatBlockingRequest.description,
                lastModifiedAt = null,
                lastModifiedBy = null,
                canceledAt = null,
                canceledBy = null,
                canceled = false
        )
    }

    fun mapChatBlockingUpdate(chatBlocking: ChatBlocking,
                              updateChatBlockingRequest: UpdateChatBlockingRequest,
                              currentUser: User
    ): ChatBlocking {
        return chatBlocking.copy(
                blockedUntil = updateChatBlockingRequest.blockedUntil ?: chatBlocking.blockedUntil,
                description = updateChatBlockingRequest.description ?: chatBlocking.description,
                lastModifiedAt = ZonedDateTime.now(),
                lastModifiedBy = currentUser
        )
    }
}
