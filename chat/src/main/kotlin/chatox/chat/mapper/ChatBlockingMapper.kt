package chatox.chat.mapper

import chatox.chat.api.request.CreateChatBlockingRequest
import chatox.chat.api.request.UpdateChatBlockingRequest
import chatox.chat.api.response.ChatBlockingResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.model.Chat
import chatox.chat.model.ChatBlocking
import chatox.chat.model.User
import chatox.chat.service.UserService
import chatox.platform.security.jwt.JwtPayload
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono
import java.time.ZonedDateTime
import java.util.UUID

@Component
class ChatBlockingMapper(private val userService: UserService) {

    fun toChatBlockingResponse(
        chatBlocking: ChatBlocking,
        localUserCache: MutableMap<String, UserResponse>? = null
    ): Mono<ChatBlockingResponse> {
        return mono {
            return@mono ChatBlockingResponse(
                id = chatBlocking.id,
                chatId = chatBlocking.chatId,
                canceledAt = chatBlocking.canceledAt,
                canceled = chatBlocking.canceled,
                createdAt = chatBlocking.createdAt,
                blockedUser = userService.findUserByIdAndPutInLocalCache(chatBlocking.blockedUserId, localUserCache)
                    .awaitFirst(),
                blockedBy = userService.findUserByIdAndPutInLocalCache(chatBlocking.blockedById, localUserCache)
                    .awaitFirst(),
                canceledBy = chatBlocking.canceledById?.let {
                    userService.findUserByIdAndPutInLocalCache(it, localUserCache).awaitFirst()
                },
                description = chatBlocking.description,
                lastModifiedAt = chatBlocking.lastModifiedAt,
                lastModifiedBy = chatBlocking.lastModifiedById?.let {
                    userService.findUserByIdAndPutInLocalCache(it, localUserCache).awaitFirst()
                },
                blockedUntil = chatBlocking.blockedUntil,
            )
        }
    }

    fun fromCreateChatBlockingRequest(
        createChatBlockingRequest: CreateChatBlockingRequest,
        chat: Chat,
        blockedUser: User,
        currentUser: JwtPayload
    ): ChatBlocking {
        return ChatBlocking(
            id = UUID.randomUUID().toString(),
            blockedById = currentUser.id,
            createdAt = ZonedDateTime.now(),
            blockedUntil = createChatBlockingRequest.blockedUntil,
            blockedUserId = blockedUser.id,
            chatId = chat.id,
            description = createChatBlockingRequest.description,
            lastModifiedAt = null,
            lastModifiedById = null,
            canceledAt = null,
            canceledById = null,
            canceled = false
        )
    }

    fun mapChatBlockingUpdate(
        chatBlocking: ChatBlocking,
        updateChatBlockingRequest: UpdateChatBlockingRequest,
        currentUser: JwtPayload
    ): ChatBlocking {
        return chatBlocking.copy(
            blockedUntil = updateChatBlockingRequest.blockedUntil ?: chatBlocking.blockedUntil,
            description = updateChatBlockingRequest.description ?: chatBlocking.description,
            lastModifiedAt = ZonedDateTime.now(),
            lastModifiedById = currentUser.id
        )
    }
}
