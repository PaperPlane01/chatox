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

    fun toChatBlockingResponse(chatBlocking: ChatBlocking, localUserCache: MutableMap<String, UserResponse>? = null): Mono<ChatBlockingResponse> {
       return mono {
           val blockedUser = userService.findUserByIdAndPutInLocalCache(chatBlocking.blockedUserId, localUserCache)
                   .awaitFirst()

           val blockedBy: UserResponse = userService.findUserByIdAndPutInLocalCache(chatBlocking.blockedById, localUserCache)
                   .awaitFirst()

           var canceledBy: UserResponse? = null
           var lastModifiedBy: UserResponse? = null

           if (chatBlocking.canceledById != null) {
              canceledBy = userService.findUserByIdAndPutInLocalCache(chatBlocking.canceledById!!, localUserCache)
                      .awaitFirst()
           }

           if (chatBlocking.lastModifiedById != null) {
               lastModifiedBy = userService.findUserByIdAndPutInLocalCache(chatBlocking.lastModifiedById!!, localUserCache)
                       .awaitFirst()
           }

           ChatBlockingResponse(
                   id = chatBlocking.id,
                   chatId = chatBlocking.chatId,
                   canceledAt = chatBlocking.canceledAt,
                   canceled = chatBlocking.canceled,
                   createdAt = chatBlocking.createdAt,
                   canceledBy = canceledBy,
                   description = chatBlocking.description,
                   lastModifiedAt = chatBlocking.lastModifiedAt,
                   lastModifiedBy = lastModifiedBy,
                   blockedUser = blockedUser,
                   blockedUntil = chatBlocking.blockedUntil,
                   blockedBy = blockedBy
           )
       }
    }

    fun fromCreateChatBlockingRequest(createChatBlockingRequest: CreateChatBlockingRequest,
                                      chat: Chat,
                                      blockedUser: User,
                                      currentUser: JwtPayload): ChatBlocking {
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

    fun mapChatBlockingUpdate(chatBlocking: ChatBlocking,
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
