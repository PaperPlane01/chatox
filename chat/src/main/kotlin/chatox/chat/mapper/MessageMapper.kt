package chatox.chat.mapper

import chatox.chat.api.request.UpdateMessageRequest
import chatox.chat.api.response.ChatRoleResponse
import chatox.chat.api.response.MessageResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.config.CacheWrappersConfig
import chatox.chat.messaging.rabbitmq.event.MessageCreated
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatRole
import chatox.chat.model.ChatType
import chatox.chat.model.EmojiInfo
import chatox.chat.model.Message
import chatox.chat.model.MessageInterface
import chatox.chat.model.ScheduledMessage
import chatox.chat.model.UnreadMessagesCount
import chatox.chat.model.Upload
import chatox.chat.service.UserService
import chatox.chat.support.cache.MessageDataLocalCache
import chatox.chat.util.NTuple7
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

    fun <T: MessageInterface> mapMessages(
            messages: Flux<T>,
            unreadMessagesCount: UnreadMessagesCount? = null,
            lastReadMessageCreatedAt: ZonedDateTime? = null
    ): Flux<MessageResponse> {
        val cache = MessageDataLocalCache()

        return if (unreadMessagesCount?.lastMessageReadAt != null) {
            messages.flatMapSequential { message ->
                toMessageResponse(
                    message = message,
                    readByCurrentUser = isDateBeforeOrEquals(
                            dateToCheck = message.createdAt,
                            dateToCompareWith = unreadMessagesCount.lastMessageReadAt
                    ),
                    readByAnyone = if (lastReadMessageCreatedAt == null) {
                        false
                    } else {
                        isDateBeforeOrEquals(
                                dateToCheck = message.createdAt,
                                dateToCompareWith = lastReadMessageCreatedAt
                        )
                    },
                    mapReferredMessage = true,
                    lastReadMessageCreatedAt = lastReadMessageCreatedAt,
                    cache = cache
            ) }
        } else {
            messages.flatMapSequential { message -> toMessageResponse(
                    message = message,
                    readByCurrentUser = false,
                    readByAnyone = if (lastReadMessageCreatedAt == null) {
                        false
                    } else {
                        isDateBeforeOrEquals(
                                dateToCheck = message.createdAt,
                                dateToCompareWith = lastReadMessageCreatedAt
                        )
                    },
                    mapReferredMessage = true,
                    lastReadMessageCreatedAt = lastReadMessageCreatedAt,
                    cache = cache
            ) }
        }
    }

    fun <T: MessageInterface> toMessageResponse(
            message: T,
            mapReferredMessage: Boolean,
            readByCurrentUser: Boolean,
            readByAnyone: Boolean = false,
            lastReadMessageCreatedAt: ZonedDateTime? = null,
            cache: MessageDataLocalCache? = null
    ): Mono<MessageResponse> {
        return mono {
            val (
                    referredMessage,
                    sender,
                    pinnedBy,
                    chatRole,
                    chatParticipationInSourceChat,
                    forwardedBy,
                    mentionedUsers
            ) = getDataForMessageResponse(
                    message = message,
                    mapReferredMessage = mapReferredMessage,
                    readByCurrentUser = readByCurrentUser,
                    localReferredMessagesCache = cache?.referredMessagesCache,
                    localUsersCache = cache?.usersCache,
                    localChatParticipationsCache = cache?.chatParticipationsCache,
                    localChatRolesCache = cache?.chatRolesCache
            )
                    .awaitFirst()

            val messageIsForwarded = message.forwardedFromMessageId != null
            val includeForwardedMessageIdAndChatId = messageIsForwarded
                    && (message.forwardedFromDialogChatType == ChatType.GROUP || chatParticipationInSourceChat != null)

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
                    senderChatRole = chatRole,
                    forwarded = message.forwardedFromMessageId != null,
                    forwardedFromMessageId = if (includeForwardedMessageIdAndChatId) {
                        message.forwardedFromMessageId
                    } else {
                        null
                    },
                    forwardedFromChatId = if (includeForwardedMessageIdAndChatId) {
                        message.forwardedFromChatId
                    } else {
                        null
                    },
                    forwardedBy = forwardedBy,
                    readByAnyone = readByAnyone,
                    mentionedUsers = mentionedUsers
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
            val (
                    referredMessage,
                    sender,
                    pinnedBy,
                    chatRole,
                    chatParticipationInSourceChat,
                    forwardedBy,
                    mentionedUsers
            ) = getDataForMessageResponse(
                    message = message,
                    mapReferredMessage = mapReferredMessage,
                    readByCurrentUser = readByCurrentUser,
                    localReferredMessagesCache = localReferredMessagesCache,
                    localUsersCache = localUsersCache,
                    localChatParticipationsCache = localChatParticipationsCache,
                    localChatRolesCache = localChatRolesCache
            )
                    .awaitFirst()

            val messageIsForwarded = message.forwardedFromMessageId != null
            val includeForwardedMessageIdAndChatId = messageIsForwarded
                    && (message.forwardedFromDialogChatType == ChatType.GROUP || chatParticipationInSourceChat != null)

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
                    fromScheduled = fromScheduled,
                    forwarded = messageIsForwarded,
                    forwardedFromMessageId = if (includeForwardedMessageIdAndChatId) {
                        message.forwardedFromMessageId
                    } else {
                        null
                    },
                    forwardedFromChatId = if (includeForwardedMessageIdAndChatId) {
                        message.forwardedFromChatId
                    } else {
                        null
                    },
                    forwardedBy = forwardedBy,
                    mentionedUsers = mentionedUsers
            )
        }
    }

    private fun <T: MessageInterface> getDataForMessageResponse(
            message: T,
            mapReferredMessage: Boolean,
            readByCurrentUser: Boolean,
            lastReadMessageCreatedAt: ZonedDateTime? = null,
            localReferredMessagesCache: MutableMap<String, MessageResponse>? = null,
            localUsersCache: MutableMap<String, UserResponse>? = null,
            localChatParticipationsCache: MutableMap<String, ChatParticipation>? = null,
            localChatRolesCache: MutableMap<String, ChatRoleResponse>? = null
    ): Mono<NTuple7<MessageResponse?, UserResponse, UserResponse?, ChatRoleResponse, ChatParticipation?, UserResponse?, List<UserResponse>>> {
        return mono {
            val referredMessage: MessageResponse? = if (!mapReferredMessage || message.referredMessageId == null) {
                null
            } else {
                getReferredMessage(
                        message,
                        readByCurrentUser,
                        lastReadMessageCreatedAt,
                        localReferredMessagesCache,
                        localUsersCache
                ).awaitFirst()
            }
            val sender: UserResponse = userService
                    .findUserByIdAndPutInLocalCache(message.senderId, localUsersCache)
                    .awaitFirst()
            val pinnedBy: UserResponse? = userService
                    .findUserByIdAndPutInLocalCache(message.pinnedById, localUsersCache)
                    .awaitFirstOrNull()
            val chatParticipation = getChatParticipation(message.chatParticipationId!!, localChatParticipationsCache)
                    .awaitFirst()
            val chatRole = getChatRole(chatParticipation.roleId, localChatRolesCache).awaitFirst()
            val chatParticipationInSourceChat = if (message.chatParticipationIdInSourceChat == null) {
                null
            } else {
                getChatParticipation(message.chatParticipationIdInSourceChat!!, localChatParticipationsCache).awaitFirst()
            }
            val forwardedBy = userService
                    .findUserByIdAndPutInLocalCache(message.forwardedById, localUsersCache)
                    .awaitFirstOrNull()
            val mentionedUsers = if (message.mentionedUsers.isEmpty()) {
                listOf()
            } else {
                userService.findAllByIdAndPutInLocalCache(message.mentionedUsers, localUsersCache)
                        .collectList()
                        .awaitFirst()

            }

            return@mono NTuple7(referredMessage, sender, pinnedBy, chatRole, chatParticipationInSourceChat, forwardedBy, mentionedUsers)
        }
    }

    private fun <T: MessageInterface> getReferredMessage(
            message: T,
            readByCurrentUser: Boolean,
            lastReadMessageCreatedAt: ZonedDateTime? = null,
            localReferredMessagesCache: MutableMap<String, MessageResponse>?,
            localUsersCache: MutableMap<String, UserResponse>?,
    ): Mono<MessageResponse> {
        return mono {
            return@mono if (localReferredMessagesCache != null && localReferredMessagesCache[message.referredMessageId!!] != null) {
                localReferredMessagesCache[message.referredMessageId!!]!!
            } else {
                val referredMessageEntity = messageCacheWrapper.findById(message.referredMessageId!!).awaitFirst()
                val referredMessage = toMessageResponse(
                        message = referredMessageEntity,
                        cache = MessageDataLocalCache(
                                usersCache = localUsersCache ?: mutableMapOf(),
                                referredMessagesCache = localReferredMessagesCache ?: mutableMapOf()
                        ),
                        readByCurrentUser = readByCurrentUser,
                        mapReferredMessage = false,
                        lastReadMessageCreatedAt = lastReadMessageCreatedAt
                )
                        .awaitFirst()

                putInLocalCache(referredMessage, localReferredMessagesCache) { it.id }
            }
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
                                  emoji: EmojiInfo = originalMessage.emoji,
                                  mentionedUsers: List<String> = originalMessage.mentionedUsers
    ) = originalMessage.copy(
            text = updateMessageRequest.text,
            emoji = emoji,
            updatedAt = ZonedDateTime.now(),
            mentionedUsers = mentionedUsers
    )
}
