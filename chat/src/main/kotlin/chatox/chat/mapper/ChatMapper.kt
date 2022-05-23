package chatox.chat.mapper

import chatox.chat.api.request.CreateChatRequest
import chatox.chat.api.response.ChatOfCurrentUserResponse
import chatox.chat.api.response.ChatResponse
import chatox.chat.api.response.ChatResponseWithCreatorId
import chatox.chat.api.response.MessageResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.messaging.rabbitmq.event.ChatUpdated
import chatox.chat.model.Chat
import chatox.chat.model.ChatInterface
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatType
import chatox.chat.model.Message
import chatox.chat.model.User
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono
import java.time.ZonedDateTime
import java.util.UUID

@Component
class ChatMapper(
        private val chatParticipationMapper: ChatParticipationMapper,
        private val messageMapper: MessageMapper,
        private val uploadMapper: UploadMapper,
        private val userMapper: UserMapper
) {
    fun toChatResponse(chat: ChatInterface, user: User? = null) = ChatResponse(
            id = chat.id,
            description = chat.description,
            name = chat.name,
            slug = chat.slug,
            avatarUri = chat.avatarUri,
            participantsCount = chat.numberOfParticipants,
            createdByCurrentUser = null,
            tags = chat.tags,
            avatar = if (chat.avatar != null) uploadMapper.toUploadResponse(chat.avatar!!) else null,
            user = if (user != null) userMapper.toUserResponse(user) else null,
            type = chat.type
    )

    fun toChatResponse(chat: ChatInterface, currentUserId: String?, user: User? = null) = ChatResponse(
            id = chat.id,
            description = chat.description,
            name = chat.name,
            slug = chat.slug,
            avatarUri = chat.avatarUri,
            participantsCount = chat.numberOfParticipants,
            onlineParticipantsCount = chat.numberOfOnlineParticipants,
            createdByCurrentUser = currentUserId ?: currentUserId == chat.createdById,
            tags = chat.tags,
            avatar = if (chat.avatar != null) uploadMapper.toUploadResponse(chat.avatar!!) else null,
            type = chat.type,
            user = if (user != null) userMapper.toUserResponse(user) else null
    )

    fun toChatOfCurrentUserResponse(
            chat: ChatInterface,
            chatParticipation: ChatParticipation,
            lastMessage: Message?,
            lastReadMessage: Message?,
            unreadMessagesCount: Long,
            onlineParticipantsCount: Int,
            localUsersCache: MutableMap<String, UserResponse>? = null,
            user: User? = null
    ): Mono<ChatOfCurrentUserResponse> {
        return mono {
            var lastReadMessageMapped: MessageResponse? = null
            var lastMessageMapped: MessageResponse? = null
            var userMapped: UserResponse? = null

            if (lastReadMessage != null && !chat.deleted) {
                lastReadMessageMapped = messageMapper.toMessageResponse(
                        lastReadMessage,
                        readByCurrentUser = true,
                        mapReferredMessage = false,
                        localUsersCache = localUsersCache
                )
                        .awaitFirst()
            }

            if (lastMessage != null && !chat.deleted) {
                lastMessageMapped = messageMapper.toMessageResponse(
                        lastMessage,
                        readByCurrentUser = lastReadMessage ?: lastReadMessage?.id == lastMessage.id,
                        mapReferredMessage = false,
                        localUsersCache = localUsersCache
                )
                        .awaitFirst()
            }

            if (user != null) {
                userMapped = userMapper.toUserResponse(user)
            }

            return@mono toChatOfCurrentUserResponse(
                    chat = chat,
                    chatParticipation = chatParticipation,
                    user = userMapped,
                    lastMessage = lastMessageMapped,
                    lastReadMessage = lastReadMessageMapped,
                    unreadMessagesCount = unreadMessagesCount,
                    onlineParticipantsCount = onlineParticipantsCount,
                    localUsersCache = localUsersCache
            ).awaitFirst()
        }
    }

    fun toChatOfCurrentUserResponse(
            chat: ChatInterface,
            chatParticipation: ChatParticipation,
            lastMessage: MessageResponse?,
            lastReadMessage: MessageResponse?,
            unreadMessagesCount: Long,
            onlineParticipantsCount: Int,
            user: User? = null
    ): Mono<ChatOfCurrentUserResponse> {
        return mono {
            val userMapped = if (user != null) {
                userMapper.toUserResponse(user)
            } else {
                null
            }

            return@mono toChatOfCurrentUserResponse(
                    chat = chat,
                    chatParticipation = chatParticipation,
                    lastMessage = lastMessage,
                    lastReadMessage = lastReadMessage,
                    unreadMessagesCount = unreadMessagesCount,
                    onlineParticipantsCount = onlineParticipantsCount,
                    user = userMapped
            ).awaitFirst()
        }
    }

    fun toChatOfCurrentUserResponse(
            chat: ChatInterface,
            chatParticipation: ChatParticipation,
            lastMessage: MessageResponse?,
            lastReadMessage: MessageResponse?,
            unreadMessagesCount: Long,
            onlineParticipantsCount: Int,
            localUsersCache: MutableMap<String, UserResponse>? = null,
            user: UserResponse? = null
    ): Mono<ChatOfCurrentUserResponse> {
        return mono {
            val avatar = if (chat.avatar != null && !chat.deleted) {
                uploadMapper.toUploadResponse(chat.avatar!!)
            } else {
                null
            }

            val chatParticipationMinified = chatParticipationMapper.toMinifiedChatParticipationResponse(
                    chatParticipation
            )
                    .awaitFirst()

            return@mono ChatOfCurrentUserResponse(
                    id = chat.id,
                    name = chat.name,
                    slug = chat.slug,
                    avatarUri = chat.avatarUri,
                    lastReadMessage = lastReadMessage,
                    lastMessage = lastMessage,
                    chatParticipation = chatParticipationMinified,
                    unreadMessagesCount = unreadMessagesCount,
                    createdAt = chat.createdAt,
                    description = chat.description,
                    tags = chat.tags,
                    participantsCount = chat.numberOfParticipants,
                    avatar = avatar,
                    createdByCurrentUser = chat.createdById == chatParticipation.user.id,
                    deleted = chat.deleted,
                    deletionReason = chat.chatDeletion?.deletionReason,
                    deletionComment = chat.chatDeletion?.comment,
                    user = user,
                    type = chat.type
            )
        }
    }

    fun toChatResponseWithCreatorId(chat: ChatInterface) = ChatResponseWithCreatorId(
            id = chat.id,
            description = chat.description,
            name = chat.name,
            slug = chat.slug,
            avatarUri = chat.avatarUri,
            participantsCount = chat.numberOfParticipants,
            onlineParticipantsCount = chat.numberOfOnlineParticipants,
            createdByCurrentUser = false,
            tags = chat.tags,
            avatar = if (chat.avatar != null) uploadMapper.toUploadResponse(chat.avatar!!) else null,
            createdById = chat.createdById,
            type = chat.type
    )

    fun fromCreateChatRequest(
            createChatRequest: CreateChatRequest,
            currentUser: User
    ): Chat {
        val id = UUID.randomUUID().toString()
        val createdAt = ZonedDateTime.now()

        return Chat(
                id = id,
                slug = createChatRequest.slug ?: id,
                name = createChatRequest.name,
                createdAt = createdAt,
                type = ChatType.GROUP,
                deleted = false,
                createdById = currentUser.id,
                tags = createChatRequest.tags,
                avatarUri = null,
                deletedAt = null,
                description = createChatRequest.description,
                updatedAt = createdAt,
                deletedById = currentUser.id,
                numberOfParticipants = 1,
                lastMessageId = null,
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
