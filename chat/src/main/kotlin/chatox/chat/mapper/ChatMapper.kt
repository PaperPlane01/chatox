package chatox.chat.mapper

import chatox.chat.api.response.ChatOfCurrentUserResponse
import chatox.chat.api.response.ChatResponse
import chatox.chat.api.response.ChatResponseWithCreatorId
import chatox.chat.api.response.MessageResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.messaging.rabbitmq.event.ChatUpdated
import chatox.chat.model.Chat
import chatox.chat.model.ChatInterface
import chatox.chat.model.ChatParticipantsCount
import chatox.chat.model.ChatParticipation
import chatox.chat.model.DraftMessage
import chatox.chat.model.Message
import chatox.chat.model.User
import chatox.chat.support.cache.MessageDataLocalCache
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class ChatMapper(
        private val chatParticipationMapper: ChatParticipationMapper,
        private val messageMapper: MessageMapper,
        private val uploadMapper: UploadMapper,
        private val userMapper: UserMapper,
) {
    fun toChatResponse(
            chat: ChatInterface,
            user: User? = null,
            chatParticipantsCount: ChatParticipantsCount? = null
    ) = ChatResponse(
            id = chat.id,
            description = chat.description,
            name = chat.name,
            slug = chat.slug,
            avatarUri = chat.avatarUri,
            participantsCount = chatParticipantsCount?.participantsCount,
            onlineParticipantsCount = chatParticipantsCount?.onlineParticipantsCount,
            createdByCurrentUser = null,
            tags = chat.tags,
            avatar = if (chat.avatar != null) uploadMapper.toUploadResponse(chat.avatar!!) else null,
            user = if (user != null) userMapper.toUserResponse(user) else null,
            type = chat.type,
            slowMode = chat.slowMode,
            joinAllowanceSettings = chat.joinAllowanceSettings,
            hideFromSearch = chat.hideFromSearch
    )

    fun toChatResponse(
            chat: ChatInterface,
            currentUserId: String?,
            user: User? = null,
            chatParticipantsCount: ChatParticipantsCount? = null
    ) = ChatResponse(
            id = chat.id,
            description = chat.description,
            name = chat.name,
            slug = chat.slug,
            avatarUri = chat.avatarUri,
            participantsCount = chatParticipantsCount?.participantsCount,
            onlineParticipantsCount = chatParticipantsCount?.onlineParticipantsCount,
            createdByCurrentUser = chat.createdById == currentUserId,
            tags = chat.tags,
            avatar = if (chat.avatar != null) uploadMapper.toUploadResponse(chat.avatar!!) else null,
            type = chat.type,
            user = if (user != null) userMapper.toUserResponse(user) else null,
            slowMode = chat.slowMode,
            joinAllowanceSettings = chat.joinAllowanceSettings,
            hideFromSearch = chat.hideFromSearch
    )

    fun toChatOfCurrentUserResponse(
            chat: ChatInterface,
            chatParticipation: ChatParticipation,
            lastMessage: Message?,
            lastReadMessage: Message?,
            draftMessage: DraftMessage?,
            unreadMessagesCount: Long,
            unreadMentionsCount: Long,
            localUsersCache: MutableMap<String, UserResponse>? = null,
            user: User? = null,
            chatParticipantsCount: ChatParticipantsCount
    ): Mono<ChatOfCurrentUserResponse> {
        return mono {
            var lastReadMessageMapped: MessageResponse? = null
            var lastMessageMapped: MessageResponse? = null
            var draftMessageMapped: MessageResponse? = null
            var userMapped: UserResponse? = null

            if (lastReadMessage != null && !chat.deleted) {
                lastReadMessageMapped = messageMapper.toMessageResponse(
                        message = lastReadMessage,
                        readByCurrentUser = true,
                        mapReferredMessage = false,
                        cache = MessageDataLocalCache(usersCache = localUsersCache ?: mutableMapOf()),
                        readByAnyone = true
                )
                        .awaitFirst()
            }

            if (lastMessage != null && !chat.deleted) {
                lastMessageMapped = messageMapper.toMessageResponse(
                        message = lastMessage,
                        readByCurrentUser = lastReadMessage?.id == lastMessage.id,
                        mapReferredMessage = false,
                        cache = MessageDataLocalCache(usersCache = localUsersCache ?: mutableMapOf()),
                        readByAnyone = chat.lastMessageReadByAnyoneId == lastMessage.id
                )
                        .awaitFirst()
            }

            if (draftMessage != null && !chat.deleted) {
                draftMessageMapped = messageMapper.toMessageResponse(
                        message = draftMessage,
                        readByCurrentUser = true,
                        mapReferredMessage = true,
                        cache = MessageDataLocalCache(usersCache = localUsersCache ?: mutableMapOf()),
                        readByAnyone = false
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
                    draftMessage = draftMessageMapped,
                    unreadMessagesCount = unreadMessagesCount,
                    unreadMentionsCount = unreadMentionsCount,
                    localUsersCache = localUsersCache,
                    chatParticipantsCount = chatParticipantsCount
            ).awaitFirst()
        }
    }

    fun toChatOfCurrentUserResponse(
            chat: ChatInterface,
            chatParticipation: ChatParticipation,
            lastMessage: MessageResponse?,
            lastReadMessage: MessageResponse?,
            draftMessage: MessageResponse?,
            unreadMessagesCount: Long,
            unreadMentionsCount: Long,
            user: User? = null,
            chatParticipantsCount: ChatParticipantsCount? = null
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
                    draftMessage = draftMessage,
                    unreadMessagesCount = unreadMessagesCount,
                    unreadMentionsCount = unreadMentionsCount,
                    user = userMapped,
                    chatParticipantsCount = chatParticipantsCount
            ).awaitFirst()
        }
    }

    fun toChatOfCurrentUserResponse(
            chat: ChatInterface,
            chatParticipation: ChatParticipation,
            lastMessage: MessageResponse?,
            lastReadMessage: MessageResponse?,
            draftMessage: MessageResponse?,
            unreadMessagesCount: Long,
            unreadMentionsCount: Long,
            localUsersCache: MutableMap<String, UserResponse>? = null,
            user: UserResponse? = null,
            chatParticipantsCount: ChatParticipantsCount? = null
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
                    draftMessage = draftMessage,
                    chatParticipation = chatParticipationMinified,
                    unreadMessagesCount = unreadMessagesCount,
                    createdAt = chat.createdAt,
                    description = chat.description,
                    tags = chat.tags,
                    participantsCount = chatParticipantsCount?.participantsCount,
                    onlineParticipantsCount = chatParticipantsCount?.onlineParticipantsCount,
                    avatar = avatar,
                    createdByCurrentUser = chat.createdById == chatParticipation.user.id,
                    deleted = chat.deleted,
                    deletionReason = chat.chatDeletion?.deletionReason,
                    deletionComment = chat.chatDeletion?.comment,
                    user = user,
                    type = chat.type,
                    slowMode = chat.slowMode,
                    joinAllowanceSettings = chat.joinAllowanceSettings,
                    hideFromSearch = chat.hideFromSearch,
                    unreadMentionsCount = unreadMentionsCount
            )
        }
    }

    fun toChatResponseWithCreatorId(chat: ChatInterface) = ChatResponseWithCreatorId(
            id = chat.id,
            description = chat.description,
            name = chat.name,
            slug = chat.slug,
            avatarUri = chat.avatarUri,
            createdByCurrentUser = false,
            tags = chat.tags,
            avatar = if (chat.avatar != null) uploadMapper.toUploadResponse(chat.avatar!!) else null,
            createdById = chat.createdById,
            type = chat.type,
            slowMode = chat.slowMode,
            hideFromSearch = chat.hideFromSearch
    )

    fun toChatUpdated(chat: Chat) = ChatUpdated(
            id = chat.id,
            avatar = if (chat.avatar != null) uploadMapper.toUploadResponse(chat.avatar) else null,
            description = chat.description,
            avatarUri = chat.avatarUri,
            createdAt = chat.createdAt,
            name = chat.name,
            slug = chat.slug,
            tags = chat.tags,
            slowMode = chat.slowMode,
            hideFromSearch = chat.hideFromSearch
    )
}
