package chatox.chat.mapper

import chatox.chat.api.request.CreateMessageRequest
import chatox.chat.api.request.UpdateMessageRequest
import chatox.chat.api.response.MessageResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.model.Chat
import chatox.chat.model.EmojiInfo
import chatox.chat.model.Message
import chatox.chat.model.MessageRead
import chatox.chat.model.ScheduledMessage
import chatox.chat.model.Sticker
import chatox.chat.model.Upload
import chatox.chat.model.User
import chatox.chat.service.UserService
import chatox.chat.util.isDateBeforeOrEquals
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime
import java.time.temporal.ChronoUnit
import java.util.UUID

@Component
class MessageMapper(private val userService: UserService,
                    private val uploadMapper: UploadMapper,
                    private val stickerMapper: StickerMapper,
                    private val messageCacheWrapper: ReactiveRepositoryCacheWrapper<Message, String>) {

    fun mapMessages(messages: Flux<Message>, lastMessageRead: MessageRead? = null): Flux<MessageResponse> {
        val localUsersCache = HashMap<String, UserResponse>()
        val localReferredMessagesCache = HashMap<String, MessageResponse>()

        if (lastMessageRead != null) {
            return messages.flatMap { message -> toMessageResponse(
                    message = message,
                    readByCurrentUser = isDateBeforeOrEquals(
                            dateToCheck = message.createdAt,
                            dateToCompareWith = lastMessageRead.date
                    ),
                    mapReferredMessage = true,
                    localUsersCache = localUsersCache,
                    localReferredMessagesCache = localReferredMessagesCache
            ) }

        } else {
            return messages.flatMap { message -> toMessageResponse(
                    message = message,
                    readByCurrentUser = false,
                    mapReferredMessage = true,
                    localReferredMessagesCache = localReferredMessagesCache,
                    localUsersCache = localUsersCache
            ) }
        }
    }

    fun toMessageResponse(
            message: Message,
            mapReferredMessage: Boolean,
            readByCurrentUser: Boolean,
            localReferredMessagesCache: MutableMap<String, MessageResponse>? = null,
            localUsersCache: MutableMap<String, UserResponse>? = null
    ): Mono<MessageResponse> {
        return mono {
            var referredMessage: MessageResponse? = null

            if (message.referredMessageId != null && mapReferredMessage) {
                if (localReferredMessagesCache != null && localReferredMessagesCache[message.referredMessageId!!] != null) {
                    referredMessage = localReferredMessagesCache[message.referredMessageId!!]!!
                } else {
                    val referredMessageEntity = messageCacheWrapper.findById(message.referredMessageId!!).awaitFirst()
                    referredMessage = toMessageResponse(
                            message = referredMessageEntity,
                            localUsersCache = localUsersCache,
                            localReferredMessagesCache = null,
                            readByCurrentUser = readByCurrentUser,
                            mapReferredMessage = false
                    )
                            .awaitFirst()

                    if (localReferredMessagesCache != null) {
                        localReferredMessagesCache[message.referredMessageId!!] = referredMessage
                    }
                }
            }

            val sender: UserResponse = if (localUsersCache != null && localUsersCache[message.senderId] != null) {
                localUsersCache[message.senderId]!!
            } else {
                userService.findUserByIdAndPutInLocalCache(message.senderId, localUsersCache)
                        .awaitFirst()
            }

            var pinnedBy: UserResponse? = null

            if (message.pinnedById != null) {
                pinnedBy = if (localUsersCache != null && localUsersCache[message.pinnedById!!] != null) {
                    localUsersCache[message.pinnedById!!]
                } else{
                    userService.findUserByIdAndPutInLocalCache(message.pinnedById!!, localUsersCache).awaitFirst()
                }
            }

            MessageResponse(
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
                    }
            )
        }
    }

    fun toMessageResponse(
            message: ScheduledMessage,
            mapReferredMessage: Boolean,
            readByCurrentUser: Boolean,
            localReferredMessagesCache: MutableMap<String, MessageResponse>? = null,
            localUsersCache: MutableMap<String, UserResponse>? = null
    ): Mono<MessageResponse> {
        return mono {
            var referredMessage: MessageResponse? = null

            if (message.referredMessageId != null && mapReferredMessage) {
                if (localReferredMessagesCache != null && localReferredMessagesCache[message.referredMessageId!!] != null) {
                    referredMessage = localReferredMessagesCache[message.referredMessageId!!]!!
                } else {
                    val referredMessageEntity = messageCacheWrapper.findById(message.referredMessageId!!).awaitFirst()
                    referredMessage = toMessageResponse(
                            message = referredMessageEntity,
                            localUsersCache = localUsersCache,
                            localReferredMessagesCache = null,
                            readByCurrentUser = readByCurrentUser,
                            mapReferredMessage = false
                    )
                            .awaitFirst()

                    if (localReferredMessagesCache != null) {
                        localReferredMessagesCache[message.referredMessageId!!] = referredMessage
                    }
                }
            }

            val sender: UserResponse = if (localUsersCache != null && localUsersCache[message.senderId] != null) {
                localUsersCache[message.senderId]!!
            } else {
                userService.findUserByIdAndPutInLocalCache(message.senderId, localUsersCache)
                        .awaitFirst()
            }

            MessageResponse(
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
                    pinnedAt = null,
                    pinned = false,
                    pinnedBy = null,
                    scheduledAt = message.scheduledAt,
                    sticker = if (message.sticker != null) {
                        stickerMapper.toStickerResponse(message.sticker!!)
                    } else {
                        null
                    }
            )
        }
    }

    fun fromCreateMessageRequest(
            createMessageRequest: CreateMessageRequest,
            sender: User,
            chat: Chat,
            referredMessage: Message?,
            emoji: EmojiInfo = EmojiInfo(),
            attachments: List<Upload<Any>>,
            chatAttachmentsIds: List<String>,
            index: Long,
            sticker: Sticker<Any>? = null
    ) = Message(
            id = UUID.randomUUID().toString(),
            createdAt = ZonedDateTime.now(),
            deleted = false,
            chatId = chat.id,
            deletedById = null,
            deletedAt = null,
            updatedAt = null,
            referredMessageId = referredMessage?.id,
            text = createMessageRequest.text,
            senderId = sender.id,
            emoji = emoji,
            attachments = attachments,
            uploadAttachmentsIds = chatAttachmentsIds,
            index = index,
            sticker = sticker
    )

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
            sticker = scheduledMessage.sticker
    )

    fun scheduledMessageFromCreateMessageRequest(
            createMessageRequest: CreateMessageRequest,
            sender: User,
            chat: Chat,
            referredMessage: Message?,
            emoji: EmojiInfo = EmojiInfo(),
            attachments: List<Upload<Any>>,
            chatAttachmentsIds: List<String>,
            sticker: Sticker<Any>? = null
    ) = ScheduledMessage(
            id = UUID.randomUUID().toString(),
            createdAt = ZonedDateTime.now(),
            deleted = false,
            chatId = chat.id,
            deletedById = null,
            deletedAt = null,
            updatedAt = null,
            referredMessageId = referredMessage?.id,
            text = createMessageRequest.text,
            senderId = sender.id,
            emoji = emoji,
            attachments = attachments,
            uploadAttachmentsIds = chatAttachmentsIds,
            scheduledAt = createMessageRequest.scheduledAt!!.truncatedTo(ChronoUnit.MINUTES),
            sticker = sticker
    )

    fun mapMessageUpdate(updateMessageRequest: UpdateMessageRequest,
                         originalMessage: Message,
                         emojis: EmojiInfo = originalMessage.emoji
    ) = originalMessage.copy(
            text = updateMessageRequest.text,
            updatedAt = ZonedDateTime.now(),
            emoji = emojis
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
