package chatox.chat.mapper

import chatox.chat.api.request.UpdateMessageRequest
import chatox.chat.api.response.ChatRoleResponse
import chatox.chat.api.response.MessageReactionsCountResponse
import chatox.chat.api.response.MessageResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.config.CacheWrappersConfig
import chatox.chat.messaging.rabbitmq.event.MessageCreated
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatRole
import chatox.chat.model.ChatType
import chatox.chat.model.DraftMessage
import chatox.chat.model.Message
import chatox.chat.model.MessageInterface
import chatox.chat.model.MessageReaction
import chatox.chat.model.ScheduledMessage
import chatox.chat.model.UnreadMessagesCount
import chatox.chat.model.Upload
import chatox.chat.model.User
import chatox.chat.repository.mongodb.MessageReactionRepository
import chatox.chat.service.UserService
import chatox.chat.support.cache.MessageDataLocalCache
import chatox.chat.support.cache.MessageDataReferredIds
import chatox.chat.util.NTuple8
import chatox.chat.util.isDateBeforeOrEquals
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.platform.text.api.response.EmojiInfo
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Component
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Component
class MessageMapper(
    private val userService: UserService,
    private val uploadMapper: UploadMapper,
    private val stickerMapper: StickerMapper,
    private val messageCacheWrapper: ReactiveRepositoryCacheWrapper<Message, String>,

    @param:Qualifier(CacheWrappersConfig.CHAT_ROLE_CACHE_WRAPPER)
    private val chatRoleCacheWrapper: ReactiveRepositoryCacheWrapper<ChatRole, String>,
    private val chatParticipationCacheWrapper: ReactiveRepositoryCacheWrapper<ChatParticipation, String>,
    private val chatRoleMapper: ChatRoleMapper,
    private val messageReactionMapper: MessageReactionMapper,
    private val messageReactionRepository: MessageReactionRepository,
    private val authenticationHolder: ReactiveAuthenticationHolder<User>
) {

    fun <T: MessageInterface> mapMessages(
        messages: List<T>,
        unreadMessagesCount: UnreadMessagesCount?,
        lastReadMessageCreatedAt: ZonedDateTime?
    ): Flux<MessageResponse> {
        return mono {
            val referredIds = getReferredIds(messages)
            val currentUserId = authenticationHolder.currentUserDetails.awaitFirstOrNull()?.id
            currentUserId?.let { referredIds.usersIds.add(it) }

            val cache = getPrePopulatedCache(messages, referredIds, currentUserId).awaitFirst()

            return@mono if (unreadMessagesCount?.lastMessageReadAt != null) {
                Flux.fromIterable(messages).flatMapSequential { message ->
                    return@flatMapSequential toMessageResponse(
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
                        cache = cache
                    )
                }
            } else {
                Flux.fromIterable(messages).flatMapSequential { message ->
                    return@flatMapSequential toMessageResponse(
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
                        cache = cache
                    )
                }
            }
        }
            .flatMapMany { it }
    }

    private fun <T: MessageInterface> getReferredIds(messages: List<T>): MessageDataReferredIds {
        val referredIds = MessageDataReferredIds()

        messages.forEach { message ->
            referredIds.apply {
                usersIds.add(message.senderId)
                message.deletedById?.let(usersIds::add)
                message.forwardedById?.let(usersIds::add)
                usersIds.addAll(message.mentionedUsers)
                usersIds.addAll(message.lastReactions.values.flatten().map(MessageReaction::userId))
            }
        }

        return referredIds
    }

    private fun <T: MessageInterface> getPrePopulatedCache(
        messages: List<T>,
        referredIds: MessageDataReferredIds,
        currentUserId: String?
    ): Mono<MessageDataLocalCache> = mono {
        val cache = MessageDataLocalCache()

        val users = userService.findAllById(referredIds.usersIds)
            .collectList()
            .awaitFirst()
            .associateBy(UserResponse::id)
        cache.usersCache.putAll(users)

        val chatParticipations = chatParticipationCacheWrapper.findByIds(referredIds.chatParticipationIds.toList())
            .collectList()
            .awaitFirst()
            .associateBy(ChatParticipation::id)
        cache.chatParticipationsCache.putAll(chatParticipations)

        val chatRoles = chatRoleCacheWrapper.findByIds(
            chatParticipations.values.map(ChatParticipation::roleId)
        )
            .collectList()
            .awaitFirst()
            .map(chatRoleMapper::toChatRoleResponse)
            .associateBy(ChatRoleResponse::id)
        cache.chatRolesCache.putAll(chatRoles)

        val currentUserReactions = currentUserId?.let {
            messageReactionRepository
                .findByUserIdAndMessageIdIn(it, messages.map(MessageInterface::id))
                .collectList()
                .awaitFirst()
                .associateBy { reaction -> "${reaction.messageId}_${reaction.emojiId}" }
        }
            ?: mapOf()
        val reactionsCountCache = messages.associate { message ->
            message.id to message.reactionsCount.map { reactionsCount ->
                val currentUserReaction = currentUserReactions["${message.id}_${reactionsCount.emojiId}"]

                return@map MessageReactionsCountResponse(
                    emoji = reactionsCount.emoji,
                    count = reactionsCount.count,
                    lastReactions = (message.lastReactions[reactionsCount.emojiId] ?: listOf()).map { reaction ->
                        messageReactionMapper.toMessageReactionResponseWithUsersCache(reaction, cache.usersCache)
                    },
                    reactedByCurrentUser = currentUserReaction != null,
                    currentUserReaction = currentUserReaction?.let { reaction ->
                        messageReactionMapper.toMessageReactionResponseWithUsersCache(reaction, cache.usersCache)
                    }
                )
            }
        }
        cache.reactionsCountCache.putAll(reactionsCountCache)

        return@mono cache
    }

    fun <T : MessageInterface> mapMessages(
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
                    cache = cache
                )
            }
        } else {
            messages.flatMapSequential { message ->
                toMessageResponse(
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
                    cache = cache
                )
            }
        }
    }

    fun <T : MessageInterface> toMessageResponse(
        message: T,
        mapReferredMessage: Boolean,
        readByCurrentUser: Boolean,
        readByAnyone: Boolean = false,
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
                mentionedUsers,
                reactionsCount
            ) = getDataForMessageResponse(
                message = message,
                mapReferredMessage = mapReferredMessage,
                readByCurrentUser = readByCurrentUser,
                localReferredMessagesCache = cache?.referredMessagesCache,
                localUsersCache = cache?.usersCache,
                localChatParticipationsCache = cache?.chatParticipationsCache,
                localChatRolesCache = cache?.chatRolesCache,
                localMessageReactionsCountCache = cache?.reactionsCountCache
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
                sticker = message.sticker?.let(stickerMapper::toStickerResponse),
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
                mentionedUsers = mentionedUsers,
                reactionsCount = reactionsCount.associateBy { it.emoji.id }
                    .entries
                    .sortedBy { it.value.count }
                    .associate { it.toPair() }
            )
        }
    }

    fun <T : MessageInterface> toMessageCreated(
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
                sticker = message.sticker?.let(stickerMapper::toStickerResponse),
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

    private fun <T : MessageInterface> getDataForMessageResponse(
        message: T,
        mapReferredMessage: Boolean,
        readByCurrentUser: Boolean,
        localReferredMessagesCache: MutableMap<String, MessageResponse>? = null,
        localUsersCache: MutableMap<String, UserResponse>? = null,
        localChatParticipationsCache: MutableMap<String, ChatParticipation>? = null,
        localChatRolesCache: MutableMap<String, ChatRoleResponse>? = null,
        localMessageReactionsCountCache: MutableMap<String, List<MessageReactionsCountResponse>>? = null
    ): Mono<NTuple8<MessageResponse?, UserResponse, UserResponse?, ChatRoleResponse, ChatParticipation?, UserResponse?, List<UserResponse>, List<MessageReactionsCountResponse>>> {
        return mono {
            val referredMessage: MessageResponse? = if (!mapReferredMessage || message.referredMessageId == null) {
                null
            } else {
                getReferredMessage(
                    message,
                    readByCurrentUser,
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
            val chatParticipationInSourceChat = message.chatParticipationIdInSourceChat?.let {
                getChatParticipation(it, localChatParticipationsCache).awaitFirst()
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
            val reactionsCount = getReactionsCount(message, localMessageReactionsCountCache, localUsersCache)
                .awaitFirst()

            return@mono NTuple8(
                referredMessage,
                sender,
                pinnedBy,
                chatRole,
                chatParticipationInSourceChat,
                forwardedBy,
                mentionedUsers,
                reactionsCount
            )
        }
    }

    private fun <T : MessageInterface> getReferredMessage(
        message: T,
        readByCurrentUser: Boolean,
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
                    mapReferredMessage = false
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
            return@mono localChatParticipationsCache?.get(id) ?: putInLocalCache(
                chatParticipationCacheWrapper.findById(id).awaitFirst(),
                localChatParticipationsCache
            ) { it.id }
        }
    }

    private fun getChatRole(
        id: String,
        localChatRolesCache: MutableMap<String, ChatRoleResponse>?
    ): Mono<ChatRoleResponse> {
        return mono {
           return@mono localChatRolesCache?.get(id) ?: putInLocalCache(
               chatRoleMapper.toChatRoleResponse(chatRoleCacheWrapper.findById(id).awaitFirst()),
               localChatRolesCache
           ) { it.id }
        }
    }

    private fun getReactionsCount(
        message: MessageInterface,
        localMessageReactionsCountCache: MutableMap<String, List<MessageReactionsCountResponse>>?,
        localUsersCache: MutableMap<String, UserResponse>?,
    ): Mono<List<MessageReactionsCountResponse>> = mono {
        var reactionsCountResponse = localMessageReactionsCountCache?.get(message.id)

        if (reactionsCountResponse != null) {
            return@mono reactionsCountResponse
        }

        val currentUserReaction = authenticationHolder.currentUserDetails?.awaitFirstOrNull()?.id?.let {
            messageReactionRepository.findByUserIdAndMessageId(it, message.id)
                .awaitFirstOrNull()
        }
        val users = userService.findAllByIdAndPutInLocalCache(
            message.lastReactions.values.flatten().map(MessageReaction::userId),
            localUsersCache
        )
            .collectList()
            .awaitFirst()
            .associateBy(UserResponse::id)

        reactionsCountResponse = message.reactionsCount.map { reactionsCount -> MessageReactionsCountResponse(
            emoji = reactionsCount.emoji,
            count = reactionsCount.count,
            lastReactions = (message.lastReactions[reactionsCount.emojiId] ?: listOf()).map { reaction ->
                messageReactionMapper.toMessageReactionResponseWithUsersCache(reaction, users)
            },
            reactedByCurrentUser = currentUserReaction?.emojiId == reactionsCount.emojiId
        ) }
        localMessageReactionsCountCache?.put(message.id, reactionsCountResponse)

        return@mono reactionsCountResponse
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

    fun fromDraftMessage(
        draftMessage: DraftMessage,
        messageIndex: Long
    ) = Message(
        id = draftMessage.id,
        createdAt = ZonedDateTime.now(),
        deleted = false,
        deletedById = null,
        deletedAt = null,
        chatId = draftMessage.chatId,
        updatedAt = null,
        referredMessageId = draftMessage.referredMessageId,
        text = draftMessage.text,
        senderId = draftMessage.senderId,
        emoji = draftMessage.emoji,
        attachments = draftMessage.attachments,
        uploadAttachmentsIds = draftMessage.uploadAttachmentsIds,
        index = messageIndex,
        fromScheduled = false,
        sticker = draftMessage.sticker,
        chatParticipationId = draftMessage.chatParticipationId
    )

    @Suppress("UNCHECKED_CAST")
    fun <T : MessageInterface> mapMessageUpdate(
        updateMessageRequest: UpdateMessageRequest,
        originalMessage: T,
        emojis: EmojiInfo = originalMessage.emoji,
        mentionedUsers: List<String> = originalMessage.mentionedUsers,
        uploads: List<Upload<*>> = originalMessage.attachments,
        chatUploadsIds: List<String> = originalMessage.uploadAttachmentsIds
    ): T {
        return when (originalMessage) {
            is Message -> {
                mapRegularMessageUpdate(
                    updateMessageRequest,
                    originalMessage,
                    emojis,
                    mentionedUsers,
                    uploads,
                    chatUploadsIds
                ) as T
            }

            is DraftMessage -> {
                mapDraftMessageUpdate(
                    updateMessageRequest,
                    originalMessage,
                    emojis,
                    mentionedUsers,
                    uploads,
                    chatUploadsIds
                ) as T
            }

            is ScheduledMessage -> {
                mapScheduledMessageUpdate(
                    updateMessageRequest,
                    originalMessage,
                    emojis,
                    mentionedUsers,
                    uploads,
                    chatUploadsIds
                ) as T
            }

            else -> {
                throw IllegalArgumentException("Unknown message type ${originalMessage::class}")
            }
        }
    }

    fun mapRegularMessageUpdate(
        updateMessageRequest: UpdateMessageRequest,
        originalMessage: Message,
        emojis: EmojiInfo = originalMessage.emoji,
        mentionedUsers: List<String> = originalMessage.mentionedUsers,
        uploads: List<Upload<*>>? = originalMessage.attachments,
        chatUploadsIds: List<String> = originalMessage.uploadAttachmentsIds
    ) = originalMessage.copy(
        text = updateMessageRequest.text,
        updatedAt = ZonedDateTime.now(),
        emoji = emojis,
        attachments = uploads ?: originalMessage.attachments,
        mentionedUsers = mentionedUsers,
        uploadAttachmentsIds = chatUploadsIds
    )

    fun mapScheduledMessageUpdate(
        updateMessageRequest: UpdateMessageRequest,
        originalMessage: ScheduledMessage,
        emojis: EmojiInfo = originalMessage.emoji,
        mentionedUsers: List<String> = originalMessage.mentionedUsers,
        uploads: List<Upload<*>> = originalMessage.attachments,
        chatUploadsIds: List<String> = originalMessage.uploadAttachmentsIds
    ) = originalMessage.copy(
        text = updateMessageRequest.text,
        emoji = emojis,
        updatedAt = ZonedDateTime.now(),
        mentionedUsers = mentionedUsers,
        attachments = uploads,
        uploadAttachmentsIds = chatUploadsIds
    )

    fun mapDraftMessageUpdate(
        updateMessageRequest: UpdateMessageRequest,
        originalMessage: DraftMessage,
        emojis: EmojiInfo = originalMessage.emoji,
        mentionedUsers: List<String> = originalMessage.mentionedUsers,
        uploads: List<Upload<*>> = originalMessage.attachments,
        chatUploadsIds: List<String> = originalMessage.uploadAttachmentsIds
    ) = originalMessage.copy(
        text = updateMessageRequest.text,
        emoji = emojis,
        updatedAt = ZonedDateTime.now(),
        mentionedUsers = mentionedUsers,
        attachments = uploads,
        uploadAttachmentsIds = chatUploadsIds
    )
}
