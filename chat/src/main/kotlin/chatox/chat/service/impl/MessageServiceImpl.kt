package chatox.chat.service.impl

import chatox.chat.api.request.CreateMessageRequest
import chatox.chat.api.request.UpdateMessageRequest
import chatox.chat.api.response.MessageResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.exception.ChatAlreadyHasPinnedMessageException
import chatox.chat.exception.MessageNotFoundException
import chatox.chat.exception.NoPinnedMessageException
import chatox.chat.exception.metadata.ChatDeletedException
import chatox.chat.exception.metadata.ChatNotFoundException
import chatox.chat.mapper.MessageMapper
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.Chat
import chatox.chat.model.ChatUploadAttachment
import chatox.chat.model.Message
import chatox.chat.model.MessageRead
import chatox.chat.model.Upload
import chatox.chat.model.User
import chatox.chat.repository.ChatMessagesCounterRepository
import chatox.chat.repository.ChatParticipationRepository
import chatox.chat.repository.ChatUploadAttachmentRepository
import chatox.chat.repository.MessageReadRepository
import chatox.chat.repository.MessageRepository
import chatox.chat.repository.UploadRepository
import chatox.chat.security.AuthenticationFacade
import chatox.chat.security.access.MessagePermissions
import chatox.chat.service.EmojiParserService
import chatox.chat.service.MessageService
import chatox.chat.util.isDateBeforeOrEquals
import chatox.platform.cache.ReactiveCacheService
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.log.LogExecution
import chatox.platform.pagination.PaginationRequest
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime
import java.util.UUID

@Service
@Transactional
@LogExecution
class MessageServiceImpl(
        private val messageRepository: MessageRepository,
        private val messageReadRepository: MessageReadRepository,
        private val chatParticipationRepository: ChatParticipationRepository,
        private val uploadRepository: UploadRepository,
        private val chatUploadAttachmentRepository: ChatUploadAttachmentRepository,
        private val chatMessagesCounterRepository: ChatMessagesCounterRepository,
        private val authenticationFacade: AuthenticationFacade,
        private val emojiParserService: EmojiParserService,
        private val messageCacheService: ReactiveCacheService<Message, String>,
        private val chatCacheWrapper: ReactiveRepositoryCacheWrapper<Chat, String>,
        private val messageMapper: MessageMapper,
        private val chatEventsPublisher: ChatEventsPublisher) : MessageService {

    private lateinit var messagePermissions: MessagePermissions

    @Autowired
    fun setMessagePermissions(messagePermissions: MessagePermissions) {
        this.messagePermissions = messagePermissions
    }

    override fun createMessage(chatId: String, createMessageRequest: CreateMessageRequest): Mono<MessageResponse> {
        return mono {
            assertCanCreateMessage(chatId).awaitFirst()

            val chat = findChatById(chatId).awaitFirst()

            if (chat.deleted) {
                throw ChatDeletedException(chat.chatDeletion)
            }

            var referredMessage: Message? = null

            if (createMessageRequest.referredMessageId != null) {
                referredMessage = findMessageEntityById(createMessageRequest.referredMessageId)
                        .awaitFirst()
            }

            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val emoji = emojiParserService.parseEmoji(
                    text = createMessageRequest.text,
                    emojiSet = createMessageRequest.emojisSet
            )
                    .awaitFirst()
            var uploadAttachments: List<ChatUploadAttachment<Any>> = listOf()
            var uploads: List<Upload<Any>> = listOf()

            if (createMessageRequest.uploadAttachments.isNotEmpty()) {
                uploads = uploadRepository.findAllById<Any>(createMessageRequest.uploadAttachments)
                        .collectList()
                        .awaitFirst()

                uploadAttachments = uploads.map { upload ->
                    ChatUploadAttachment(
                            id = UUID.randomUUID().toString(),
                            chatId = chat.id,
                            upload = upload,
                            type = upload.type,
                            uploadCreatorId = upload.userId,
                            uploadSenderId = currentUser.id,
                            messageId = null,
                            createdAt = ZonedDateTime.now(),
                            uploadId = upload.id
                    )
                 }
            }

            val messageIndex = chatMessagesCounterRepository.getNextCounterValue(chat).awaitFirst()
            var message = messageMapper.fromCreateMessageRequest(
                    createMessageRequest = createMessageRequest,
                    sender = currentUser,
                    referredMessage = referredMessage,
                    chat = chat,
                    emoji = emoji,
                    attachments = uploads,
                    chatAttachmentsIds = uploadAttachments.map { attachment -> attachment.id },
                    index = messageIndex
            )
            message = messageRepository.save(message).awaitFirst()

            if (uploadAttachments.isNotEmpty()) {
                uploadAttachments = uploadAttachments.map { uploadAttachment ->
                    uploadAttachment.copy(messageId = message.id, createdAt = message.createdAt)
                }
                chatUploadAttachmentRepository.saveAll(uploadAttachments)
                        .collectList()
                        .awaitFirst()
            }

            val response = messageMapper.toMessageResponse(
                    message = message,
                    readByCurrentUser = true,
                    mapReferredMessage = true
            )
                    .awaitFirst()

            Mono.fromRunnable<Void>{ chatEventsPublisher.messageCreated(response) }.subscribe()

            return@mono response
        }
    }

    private fun assertCanCreateMessage(chatId: String): Mono<Boolean> {
        return messagePermissions.canCreateMessage(chatId)
                .map {
                    if (!it) {
                        Mono.error<Boolean>(AccessDeniedException("Can't create message"))
                    } else {
                        Mono.just(it)
                    }
                }
                .flatMap { it }
    }

    override fun updateMessage(id: String, chatId: String, updateMessageRequest: UpdateMessageRequest): Mono<MessageResponse> {
        return mono {
            assertCanUpdateMessage(id, chatId).awaitFirst()
            var message = findMessageEntityById(id).awaitFirst()
            val chat = findChatById(chatId).awaitFirst()

            if (chat.deleted) {
                throw ChatDeletedException(chat.chatDeletion)
            }

            val originalMessageText = message.text
            message = messageMapper.mapMessageUpdate(
                    updateMessageRequest = updateMessageRequest,
                    originalMessage = message
            )

            if (originalMessageText != message.text) {
                val emoji = emojiParserService.parseEmoji(
                        text = message.text,
                        emojiSet = updateMessageRequest.emojisSet
                )
                        .awaitFirst()
                message = message.copy(emoji = emoji)
            }

            message = messageRepository.save(message).awaitFirst()

            val response = messageMapper.toMessageResponse(
                    message = message,
                    mapReferredMessage = true,
                    readByCurrentUser = true
            )
                    .awaitFirst()

            Mono.fromRunnable<Void>{ chatEventsPublisher.messageUpdated(response) }.subscribe()

            return@mono response
        }
    }

    private fun assertCanUpdateMessage(id: String, chatId: String): Mono<Boolean> {
        return messagePermissions.canUpdateMessage(id, chatId)
                .flatMap {
                    if (it) {
                        Mono.just(it)
                    } else {
                        Mono.error<Boolean>(AccessDeniedException("Can't update message"))
                    }
                }
    }

    override fun deleteMessage(id: String, chatId: String): Mono<Void> {
        return mono {
            assertCanDeleteMessage(id, chatId).awaitFirst()
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val message = findMessageEntityById(id).awaitFirst()

            messageRepository.save(message.copy(
                    deleted = true,
                    deletedAt = ZonedDateTime.now(),
                    deletedById = currentUser.id
            ))
                    .awaitFirst()

            Mono.fromRunnable<Void>{ chatEventsPublisher.messageDeleted(chatId = message.chatId, messageId = message.id) }.subscribe()

            return@mono Mono.empty<Void>()
        }
                .flatMap { it }

    }

    private fun assertCanDeleteMessage(id: String, chatId: String): Mono<Boolean> {
        return messagePermissions.canDeleteMessage(id, chatId)
                .flatMap {
                    if (it) {
                        Mono.just(it)
                    } else {
                        Mono.error<Boolean>(AccessDeniedException("Can't delete message"))
                    }
                }
    }

    override fun findMessageById(id: String): Mono<MessageResponse> {
        return findMessageEntityById(id, true)
                .flatMap { messageMapper.toMessageResponse(
                        message = it,
                        mapReferredMessage = true,
                        readByCurrentUser = true
                ) }
    }

    override fun findMessagesByChat(chatId: String, paginationRequest: PaginationRequest): Flux<MessageResponse> {
        return mono {
            val chat = findChatById(chatId).awaitFirst()
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val messages = messageRepository.findByChatId(chat.id, paginationRequest.toPageRequest())
            val hasAnyReadMessages = messageReadRepository.existsByUserIdAndChatId(
                    userId = currentUser.id,
                    chatId = chat.id
            )
                    .awaitFirst()

            mapMessages(messages = messages, hasAnyReadMessages = hasAnyReadMessages, currentUser = currentUser, chat = chat)
        }
                .flatMapMany { it }
    }

    override fun findMessagesSinceMessageByChat(
            chatId: String,
            sinceMessageId: String,
            paginationRequest: PaginationRequest
    ): Flux<MessageResponse> {
        return mono {
            val chat = findChatById(chatId).awaitFirst()
            val cursorMessage = findMessageEntityById(sinceMessageId).awaitFirst()
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val messages = messageRepository.findByChatIdAndCreatedAtGreaterThanEqual(
                    chatId = chat.id,
                    date = cursorMessage.createdAt,
                    pageable = paginationRequest.toPageRequest()
            )
            val hasAnyReadMessages = messageReadRepository.existsByUserIdAndChatId(
                    userId = currentUser.id,
                    chatId = chat.id
            )
                    .awaitFirst()

            mapMessages(
                    messages = messages,
                    hasAnyReadMessages = hasAnyReadMessages,
                    currentUser = currentUser,
                    chat = chat
            )
        }
                .flatMapMany { it }
    }

    override fun findMessagesBeforeMessageByChat(
            chatId: String,
            beforeMessageId: String,
            paginationRequest: PaginationRequest
    ): Flux<MessageResponse> {
        return mono {
            val chat = findChatById(chatId).awaitFirst()
            val cursorMessage = findMessageEntityById(beforeMessageId).awaitFirst()
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val messages = messageRepository.findByChatIdAndCreatedAtLessThanEqual(
                    chatId = chat.id,
                    date = cursorMessage.createdAt,
                    pageable = paginationRequest.toPageRequest()
            )
            val hasAnyReadMessages = messageReadRepository.existsByUserIdAndChatId(
                    userId = currentUser.id,
                    chatId = chat.id
            )
                    .awaitFirst()

            mapMessages(
                    messages = messages,
                    hasAnyReadMessages = hasAnyReadMessages,
                    currentUser = currentUser,
                    chat = chat
            )
        }
                .flatMapMany { it }
    }

    private fun mapMessages(messages: Flux<Message>, hasAnyReadMessages: Boolean, currentUser: User, chat: Chat): Flux<MessageResponse> {
        return mono {
            val response = if (hasAnyReadMessages) {
                val lastMessageRead = messageReadRepository.findTopByUserIdAndChatIdOrderByDateDesc(
                        userId = currentUser.id,
                        chatId = chat.id
                )
                        .awaitFirst()
                mapMessages(messages, lastMessageRead)
            } else {
                mapMessages(messages)
            }

            response
        }
                .flatMapMany { it }
    }

    private fun mapMessages(messages: Flux<Message>, lastMessageRead: MessageRead? = null): Flux<MessageResponse> {
        val localUsersCache = HashMap<String, UserResponse>()
        val localReferredMessagesCache = HashMap<String, MessageResponse>()

        if (lastMessageRead != null) {
            return messages.flatMap { message -> messageMapper.toMessageResponse(
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
            return messages.flatMap { message -> messageMapper.toMessageResponse(
                    message = message,
                    readByCurrentUser = false,
                    mapReferredMessage = true,
                    localReferredMessagesCache = localReferredMessagesCache,
                    localUsersCache = localUsersCache
            ) }
        }
    }

    override fun markMessageRead(messageId: String): Mono<Void> {
        return mono {
            val message = findMessageEntityById(messageId = messageId, retrieveFromCache = true)
                    .awaitFirst()
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()

            val messageRead = messageReadRepository.save(MessageRead(
                    id = UUID.randomUUID().toString(),
                    date = ZonedDateTime.now(),
                    messageId = message.id,
                    userId = currentUser.id,
                    chatId = message.chatId
            ))
                    .awaitFirst()

            val chatParticipation = chatParticipationRepository.findByChatIdAndUser(
                    chatId = message.chatId,
                    user = currentUser
            )
                    .awaitFirst()

            if (chatParticipation.lastReadMessageId != null) {
                val lastReadMessage = findMessageEntityById(
                        messageId = chatParticipation.lastReadMessageId!!,
                        retrieveFromCache = true
                )
                        .awaitFirst()

                if (isDateBeforeOrEquals(lastReadMessage.createdAt, message.createdAt)) {
                    chatParticipationRepository.save(chatParticipation.copy(
                            lastMessageReadId = messageRead.id,
                            lastReadMessageId = messageId,
                            lastReadMessageAt = messageRead.date
                    ))
                            .awaitFirst()
                }
            }
        }
                .flatMap { Mono.empty<Void>() }
    }

    override fun pinMessage(id: String, chatId: String): Mono<MessageResponse> {
        return mono {
            assertCanPinMessage(id, chatId).awaitFirst()

            if (messageRepository.findByPinnedTrueAndChatId(chatId).awaitFirstOrNull() != null) {
                throw ChatAlreadyHasPinnedMessageException("Chat $chatId already has pinned message")
            }

            var message = findMessageEntityById(id).awaitFirst()
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()

            message = message.copy(pinnedAt = ZonedDateTime.now(), pinned = true, pinnedById = currentUser.id)
            messageRepository.save(message).awaitFirst()

            val messageResponse = messageMapper.toMessageResponse(
                    message = message,
                    mapReferredMessage = true,
                    readByCurrentUser = true
            )
                    .awaitFirst()

            Mono.fromRunnable<Void>{ chatEventsPublisher.messagePinned(messageResponse) }.subscribe()

            return@mono messageResponse
        }
    }

    private fun assertCanPinMessage(messageId: String, chatId: String): Mono<Boolean> {
        return mono {
            if (messagePermissions.canPinMessage(messageId = messageId, chatId = chatId).awaitFirst()) {
                return@mono true
            } else {
                throw AccessDeniedException("Cannot pin message")
            }
        }
    }

    override fun unpinMessage(id: String, chatId: String): Mono<MessageResponse> {
        return mono {
            assertCanUnpinMessage(messageId = id, chatId = chatId).awaitFirst()

            var message = findMessageEntityById(id).awaitFirst()

            message = message.copy(pinned = false, pinnedAt = null, pinnedById = null)
            messageRepository.save(message).awaitFirst()

            val messageResponse = messageMapper.toMessageResponse(
                    message = message,
                    readByCurrentUser = true,
                    mapReferredMessage = true
            )
                    .awaitFirst()

            Mono.fromRunnable<Void>{ chatEventsPublisher.messageUnpinned(messageResponse) }.subscribe()

            return@mono messageResponse
        }
    }

    override fun findPinnedMessageByChat(chatId: String): Mono<MessageResponse> {
        return mono {
            val pinnedMessage = messageRepository.findByPinnedTrueAndChatId(chatId).awaitFirstOrNull()
                    ?: throw NoPinnedMessageException("Chat $chatId doesn't have pinned message")

            return@mono messageMapper.toMessageResponse(
                    message = pinnedMessage,
                    readByCurrentUser = true,
                    mapReferredMessage = true
            )
                    .awaitFirst()
        }
    }

    private fun assertCanUnpinMessage(messageId: String, chatId: String): Mono<Boolean> {
        return mono {
            if (messagePermissions.canUnpinMessage(messageId = messageId, chatId = chatId).awaitFirst()) {
                return@mono true
            } else {
                throw AccessDeniedException("Cannot unpin message")
            }
        }
    }

    private fun findChatById(chatId: String): Mono<Chat> {
        return mono {
            val chat = chatCacheWrapper.findById(chatId).awaitFirstOrNull()
                    ?: throw ChatNotFoundException("Could not find chat with id $chatId")

            if (chat.deleted) {
                throw ChatDeletedException(chat.chatDeletion)
            }

            chat
        }
    }

    private fun findMessageEntityById(messageId: String, retrieveFromCache: Boolean = false): Mono<Message> {
        return mono {
            var message: Message? = null

            if (retrieveFromCache) {
                message = messageCacheService.find(messageId).awaitFirstOrNull()
            }

            if (message == null) {
                message = messageRepository.findById(messageId).awaitFirstOrNull()
            }

            if (message == null) {
                throw MessageNotFoundException("Could not find message with id $messageId")
            }

            message
        }
    }
}
