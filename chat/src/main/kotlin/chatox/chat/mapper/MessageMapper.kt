package chatox.chat.mapper

import chatox.chat.api.request.UpdateMessageRequest
import chatox.chat.api.response.ChatRoleResponse
import chatox.chat.api.response.MessageResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.config.CacheWrappersConfig
import chatox.chat.messaging.rabbitmq.event.MessageCreated
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatRole
import chatox.chat.model.EmojiInfo
import chatox.chat.model.Message
import chatox.chat.model.MessageInterface
import chatox.chat.model.MessageRead
import chatox.chat.model.ScheduledMessage
import chatox.chat.model.Upload
import chatox.chat.service.UserService
import chatox.chat.util.NTuple4
import chatox.chat.util.isDateBeforeOrEquals
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Component
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Component
class MessageMapper(private val userService: UserService,
                    private val uploadMapper: UploadMapper,
                    private val stickerMapper: StickerMapper,
                    private val messageCacheWrapper: ReactiveRepositoryCacheWrapper<Message, String>,

                    @Qualifier(CacheWrappersConfig.CHAT_ROLE_CACHE_WRAPPER)
                    private val chatRoleCacheWrapper: ReactiveRepositoryCacheWrapper<ChatRole, String>,
                    private val chatParticipationCacheWrapper: ReactiveRepositoryCacheWrapper<ChatParticipation, String>,
                    private val chatRoleMapper: ChatRoleMapper) {

    fun <T: MessageInterface> mapMessages(messages: Flux<T>, lastMessageRead: MessageRead? = null): Flux<MessageResponse> {
        val localUsersCache = HashMap<String, UserResponse>()
        val localReferredMessagesCache = HashMap<String, MessageResponse>()
        val localChatParticipationsCache = HashMap<String, ChatParticipation>()
        val localChatRolesCache = HashMap<String, ChatRoleResponse>()

        if (lastMessageRead != null) {
            return messages.flatMap { message -> toMessageResponse(
                    message = message,
                    readByCurrentUser = isDateBeforeOrEquals(
                            dateToCheck = message.createdAt,
                            dateToCompareWith = lastMessageRead.date
                    ),
                    mapReferredMessage = true,
                    localUsersCache = localUsersCache,
                    localReferredMessagesCache = localReferredMessagesCache,
                    localChatParticipationsCache = localChatParticipationsCache,
                    localChatRolesCache = localChatRolesCache
            ) }

        } else {
            return messages.flatMap { message -> toMessageResponse(
                    message = message,
                    readByCurrentUser = false,
                    mapReferredMessage = true,
                    localReferredMessagesCache = localReferredMessagesCache,
                    localUsersCache = localUsersCache,
                    localChatParticipationsCache = localChatParticipationsCache,
                    localChatRolesCache = localChatRolesCache
            ) }
        }
    }

    fun <T: MessageInterface> toMessageResponse(
            message: T,
            mapReferredMessage: Boolean,
            readByCurrentUser: Boolean,
            localReferredMessagesCache: MutableMap<String, MessageResponse>? = null,
            localUsersCache: MutableMap<String, UserResponse>? = null,
            localChatParticipationsCache: MutableMap<String, ChatParticipation>? = null,
            localChatRolesCache: MutableMap<String, ChatRoleResponse>? = null
    ): Mono<MessageResponse> {
        return mono {
            val (referredMessage, sender, pinnedBy, chatRole) = getDataForMessageResponse(
                    message = message,
                    mapReferredMessage = mapReferredMessage,
                    readByCurrentUser = readByCurrentUser,
                    localReferredMessagesCache = localReferredMessagesCache,
                    localUsersCache = localUsersCache,
                    localChatParticipationsCache = localChatParticipationsCache,
                    localChatRolesCache = localChatRolesCache
            )
                    .awaitFirst()

            return@mono MessageResponse(
                    id = message.id,
                    deleted = message.deleted,
                    createdAt = message.createdAt,
                    sender = sender,
                    text = message.text,
                    readByCurrentUser = readByCurrentUser,
                    referredMessage = referredMessage,
                    updatedAt = message.updatedAt,
                    chatId = message.chatId,
                    emoji = message.emoji,
                    attachments = message.attachments.map { attachment ->
                        uploadMapper.toUploadResponse(
                                attachment
                        )
                    },
                    index = message.index,
                    pinned = message.pinned,
                    pinnedAt = message.pinnedAt,
                    pinnedBy = pinnedBy,
                    sticker = if (message.sticker != null) {
                        stickerMapper.toStickerResponse(message.sticker!!)
                    } else {
                        null
                    },
                    scheduledAt = message.scheduledAt,
                    senderChatRole = chatRole
            )
        }
    }

    fun <T: MessageInterface> toMessageCreated(
            message: T,
            mapReferredMessage: Boolean,
            readByCurrentUser: Boolean,
            localReferredMessagesCache: MutableMap<String, MessageResponse>? = null,
            localUsersCache: MutableMap<String, UserResponse>? = null,
            localChatParticipationsCache: MutableMap<String, ChatParticipation>? = null,
            localChatRolesCache: MutableMap<String, ChatRoleResponse>? = null,
            fromScheduled: Boolean = false
    ): Mono<MessageCreated> {
        return mono {
            val (referredMessage, sender, pinnedBy, chatRole) = getDataForMessageResponse(
                    message = message,
                    mapReferredMessage = mapReferredMessage,
                    readByCurrentUser = readByCurrentUser,
                    localReferredMessagesCache = localReferredMessagesCache,
                    localUsersCache = localUsersCache,
                    localChatParticipationsCache = localChatParticipationsCache,
                    localChatRolesCache = localChatRolesCache
            )
                    .awaitFirst()

            return@mono MessageCreated(
                    id = message.id,
                    deleted = message.deleted,
                    createdAt = message.createdAt,
                    sender = sender,
                    text = message.text,
                    readByCurrentUser = readByCurrentUser,
                    referredMessage = referredMessage,
                    updatedAt = message.updatedAt,
                    chatId = message.chatId,
                    emoji = message.emoji,
                    attachments = message.attachments.map { attachment ->
                        uploadMapper.toUploadResponse(
                                attachment
                        )
                    },
                    index = message.index,
                    pinned = message.pinned,
                    pinnedAt = message.pinnedAt,
                    pinnedBy = pinnedBy,
                    sticker = if (message.sticker != null) {
                        stickerMapper.toStickerResponse(message.sticker!!)
                    } else {
                        null
                    },
                    scheduledAt = message.scheduledAt,
                    senderChatRole = chatRole,
                    fromScheduled = fromScheduled
            )
        }
    }

    private fun <T: MessageInterface> getDataForMessageResponse(
            message: T,
            mapReferredMessage: Boolean,
            readByCurrentUser: Boolean,
            localReferredMessagesCache: MutableMap<String, MessageResponse>? = null,
            localUsersCache: MutableMap<String, UserResponse>? = null,
            localChatParticipationsCache: MutableMap<String, ChatParticipation>? = null,
            localChatRolesCache: MutableMap<String, ChatRoleResponse>? = null
    ): Mono<NTuple4<MessageResponse?, UserResponse, UserResponse?, ChatRoleResponse>> {
        return mono {
            val referredMessage: MessageResponse? = if (!mapReferredMessage || message.referredMessageId == null) {
                null
            } else {
                getReferredMessage(message, readByCurrentUser, localReferredMessagesCache, localUsersCache).awaitFirst()
            }
            val sender: UserResponse = getUser(message.senderId, localUsersCache).awaitFirst()
            val pinnedBy: UserResponse? = getOptionalUser(message.pinnedById, localUsersCache).awaitFirstOrNull()
            val chatParticipation = getChatParticipation(message.chatParticipationId!!, localChatParticipationsCache)
                    .awaitFirst()
            val chatRole = getChatRole(chatParticipation.roleId, localChatRolesCache).awaitFirst()

            return@mono NTuple4(referredMessage, sender, pinnedBy, chatRole)
        }
    }

    private fun <T: MessageInterface> getReferredMessage(
            message: T,
            readByCurrentUser: Boolean,
            localReferredMessagesCache: MutableMap<String, MessageResponse>?,
            localUsersCache: MutableMap<String, UserResponse>?,
    ): Mono<MessageResponse> {
        return mono {
            if (localReferredMessagesCache != null && localReferredMessagesCache[message.referredMessageId!!] != null) {
                return@mono localReferredMessagesCache[message.referredMessageId!!]!!
            } else {
                val referredMessageEntity = messageCacheWrapper.findById(message.referredMessageId!!).awaitFirst()
                val referredMessage = toMessageResponse(
                        message = referredMessageEntity,
                        localUsersCache = localUsersCache,
                        localReferredMessagesCache = null,
                        readByCurrentUser = readByCurrentUser,
                        mapReferredMessage = false
                )
                        .awaitFirst()

                return@mono putInLocalCache(referredMessage, localReferredMessagesCache) { it.id }
            }
        }
    }

    private fun getUser(id: String, localUsersCache: MutableMap<String, UserResponse>?): Mono<UserResponse> {
        return mono {
            if (localUsersCache != null && localUsersCache.containsKey(id)) {
                return@mono localUsersCache[id]!!
            }

            return@mono userService
                    .findUserByIdAndPutInLocalCache(id, localUsersCache)
                    .awaitFirst()
        }
    }

    private fun getOptionalUser(id: String?, localUsersCache: MutableMap<String, UserResponse>?): Mono<UserResponse?> {
        return mono {
            if (id == null) {
                return@mono null
            }

            if (localUsersCache != null && localUsersCache.containsKey(id)) {
                return@mono localUsersCache[id]!!
            }

            return@mono userService
                    .findUserByIdAndPutInLocalCache(id, localUsersCache)
                    .awaitFirstOrNull()
        }
    }

    private fun getChatParticipation(
            id: String,
            localChatParticipationsCache: MutableMap<String, ChatParticipation>?
    ): Mono<ChatParticipation> {
        return mono {
            if (localChatParticipationsCache != null && localChatParticipationsCache.containsKey(id)) {
                return@mono localChatParticipationsCache[id]!!
            }

            val chatParticipation = chatParticipationCacheWrapper.findById(id).awaitFirst()

            return@mono putInLocalCache(chatParticipation, localChatParticipationsCache) { it.id }
        }
    }

    private fun getChatRole(
            id: String,
            localChatRolesCache: MutableMap<String, ChatRoleResponse>?
    ): Mono<ChatRoleResponse> {
        return mono {
            if (localChatRolesCache != null && localChatRolesCache.containsKey(id)) {
                return@mono localChatRolesCache[id]!!
            }

            return@mono putInLocalCache(
                    chatRoleMapper.toChatRoleResponse(chatRoleCacheWrapper.findById(id).awaitFirst()),
                    localChatRolesCache
            ) { it.id }
        }
    }

    private fun <T> putInLocalCache(item: T, cache: MutableMap<String, T>?, extractKey: (T) -> String): T {
        if (cache == null) {
            return item
        }

        cache[extractKey(item)] = item
        return item
    }

    fun fromScheduledMessage(
            scheduledMessage: ScheduledMessage,
            messageIndex: Long,
            useCurrentDateInsteadOfScheduledDate: Boolean = false
    ) = Message(
            id = scheduledMessage.id,
            createdAt = if (useCurrentDateInsteadOfScheduledDate) ZonedDateTime.now() else scheduledMessage.scheduledAt,
            deleted = false,
            deletedById = null,
            deletedAt = null,
            chatId = scheduledMessage.chatId,
            updatedAt = null,
            referredMessageId = scheduledMessage.referredMessageId,
            text = scheduledMessage.text,
            senderId = scheduledMessage.senderId,
            emoji = scheduledMessage.emoji,
            attachments = scheduledMessage.attachments,
            uploadAttachmentsIds = scheduledMessage.uploadAttachmentsIds,
            index = messageIndex,
            fromScheduled = true,
            sticker = scheduledMessage.sticker,
            chatParticipationId = scheduledMessage.chatParticipationId
    )

    fun mapMessageUpdate(updateMessageRequest: UpdateMessageRequest,
                         originalMessage: Message,
                         emojis: EmojiInfo = originalMessage.emoji,
                         uploads: List<Upload<*>>? = null,
                         chatUploadsIds: List<String>? = null
    ) = originalMessage.copy(
            text = updateMessageRequest.text,
            updatedAt = ZonedDateTime.now(),
            emoji = emojis,
            attachments = uploads ?: originalMessage.attachments,
            uploadAttachmentsIds = chatUploadsIds ?: originalMessage.uploadAttachmentsIds
    )

    fun mapScheduledMessageUpdate(updateMessageRequest: UpdateMessageRequest,
                                  originalMessage: ScheduledMessage,
                                  emoji: EmojiInfo = originalMessage.emoji
    ) = originalMessage.copy(
            text = updateMessageRequest.text,
            emoji = emoji,
            updatedAt = ZonedDateTime.now()
    )
}
