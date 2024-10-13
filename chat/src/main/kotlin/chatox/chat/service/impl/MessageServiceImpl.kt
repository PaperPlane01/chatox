package chatox.chat.service.impl

import chatox.chat.api.request.DeleteMultipleMessagesRequest
import chatox.chat.api.request.UpdateMessageRequest
import chatox.chat.api.response.MessageResponse
import chatox.chat.config.CacheWrappersConfig
import chatox.chat.exception.ChatAlreadyHasPinnedMessageException
import chatox.chat.exception.MessageNotFoundException
import chatox.chat.exception.NoPinnedMessageException
import chatox.chat.exception.metadata.ChatDeletedException
import chatox.chat.exception.metadata.ChatNotFoundException
import chatox.chat.mapper.MessageMapper
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.Chat
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatUploadAttachment
import chatox.chat.model.Message
import chatox.chat.model.MessageInterface
import chatox.chat.model.MessageUpdateResult
import chatox.chat.model.UnreadMessagesCount
import chatox.chat.model.User
import chatox.chat.repository.mongodb.ChatParticipationRepository
import chatox.chat.repository.mongodb.ChatUploadAttachmentRepository
import chatox.chat.repository.mongodb.MessageMongoRepository
import chatox.chat.repository.mongodb.UnreadMessagesCountRepository
import chatox.chat.repository.mongodb.UploadRepository
import chatox.chat.service.ChatUploadAttachmentEntityService
import chatox.chat.service.TextParserService
import chatox.chat.service.MessageEntityService
import chatox.chat.service.MessageReadService
import chatox.chat.service.MessageService
import chatox.chat.util.NTuple2
import chatox.chat.util.mapTo2Lists
import chatox.platform.cache.ReactiveCacheService
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.log.LogExecution
import chatox.platform.pagination.PaginationRequest
import chatox.platform.security.jwt.JwtPayload
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime
import java.util.UUID

@Service
@LogExecution
class MessageServiceImpl(
        private val messageRepository: MessageMongoRepository,
        private val unreadMessagesCountRepository: UnreadMessagesCountRepository,
        private val uploadRepository: UploadRepository,
        private val chatUploadAttachmentRepository: ChatUploadAttachmentRepository,
        private val chatParticipationRepository: ChatParticipationRepository,
        private val authenticationHolder: ReactiveAuthenticationHolder<User>,
        private val textParser: TextParserService,
        private val chatUploadAttachmentEntityService: ChatUploadAttachmentEntityService,
        private val messageEntityService: MessageEntityService,
        private val messageReadService: MessageReadService,
        private val messageCacheService: ReactiveCacheService<Message, String>,

        @Qualifier(CacheWrappersConfig.CHAT_BY_ID_CACHE_WRAPPER)
        private val chatCacheWrapper: ReactiveRepositoryCacheWrapper<Chat, String>,
        private val chatEventsPublisher: ChatEventsPublisher,
        private val messageMapper: MessageMapper
) : MessageService {

    override fun updateMessage(id: String, chatId: String, updateMessageRequest: UpdateMessageRequest): Mono<MessageResponse> {
        return mono {
            val updateResult = findMessageEntityById(id)
                    .flatMap { existingMessage -> updateMessage(existingMessage, updateMessageRequest) }
                    .awaitFirst()

            if (updateResult.newChatUploadAttachments.isNotEmpty()) {
                chatUploadAttachmentEntityService.linkChatUploadAttachmentsToMessage(
                        updateResult.newChatUploadAttachments,
                        updateResult.updatedMessage
                )
                        .subscribe()
            }

            if (updateResult.chatUploadsAttachmentsToRemove.isNotEmpty()) {
                chatUploadAttachmentEntityService.deleteChatUploadAttachments(updateResult.chatUploadsAttachmentsToRemove)
                        .subscribe()
            }

            if (updateResult.newMentionedChatParticipants.isNotEmpty()) {
                messageReadService.increaseUnreadMentionsCount(
                        updateResult.newMentionedChatParticipants.map { it.id }
                )
                        .subscribe()
            }

            if (updateResult.unmentionedChatParticipants.isNotEmpty()) {
                decreaseUnreadMentionsCount(updateResult.updatedMessage, updateResult.unmentionedChatParticipants)
                        .subscribe()
            }

            return@mono messageEntityService.updateMessage(updateResult.updatedMessage).awaitFirst()
        }
    }

    private fun decreaseUnreadMentionsCount(message: Message, unmentionedChatParticipants: List<ChatParticipation>): Mono<Unit> {
        val filteredChatParticipants = unmentionedChatParticipants
                .filter { chatParticipation ->
                    chatParticipation.lastReadMessageCreatedAt == null
                            || chatParticipation.lastReadMessageCreatedAt.isBefore(message.createdAt)
                }
                .map { chatParticipation -> chatParticipation.id }

        return messageReadService.decreaseUnreadMentionsCount(filteredChatParticipants)
    }

    override fun <T : MessageInterface> updateMessage(message: T, updateMessageRequest: UpdateMessageRequest, updatedBy: JwtPayload?): Mono<MessageUpdateResult<T>> {
        return mono {
            val updatedByUser = updatedBy ?: authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val chat = findChatById(message.chatId).awaitFirst()

            if (chat.deleted) {
                throw ChatDeletedException(chat.chatDeletion)
            }

            val existingUploadsIds = message.attachments.map { upload -> upload.id }
            val uploadIdsToDeleteFromAttachments = existingUploadsIds
                    .filter { uploadId -> !updateMessageRequest.uploadAttachments.contains(uploadId) }
            var chatUploadsIds = message.uploadAttachmentsIds.toMutableList()
            var chatUploadsToRemove: List<ChatUploadAttachment<*>>? = null
            var attachments = message.attachments.toMutableList()

            if (uploadIdsToDeleteFromAttachments.isNotEmpty()) {
                chatUploadsToRemove = chatUploadAttachmentRepository.findByMessageIdAndUploadIdIn(
                        messageId = message.id,
                        uploadsIds = uploadIdsToDeleteFromAttachments
                )
                        .collectList()
                        .awaitFirst()
                val attachmentsIdsToRemove = chatUploadsToRemove.map { attachment -> attachment.id }
                chatUploadsIds = chatUploadsIds
                        .filter { attachmentId -> !attachmentsIdsToRemove.contains(attachmentId) }
                        .toMutableList()
                attachments = attachments
                        .filter { upload -> !uploadIdsToDeleteFromAttachments.contains(upload.id) }
                        .toMutableList()
            }

            var newChatUploads: List<ChatUploadAttachment<*>>? = null
            val newUploadsIds = updateMessageRequest.uploadAttachments
                    .filter { uploadId -> !existingUploadsIds.contains(uploadId) }

            if (newUploadsIds.isNotEmpty()) {
                val newUploads = uploadRepository.findAllById<Any>(newUploadsIds).collectList().awaitFirst()
                attachments.addAll(newUploads)
                newChatUploads = newUploads.map { upload ->
                    ChatUploadAttachment(
                            id = UUID.randomUUID().toString(),
                            chatId = chat.id,
                            upload = upload,
                            type = upload.type,
                            uploadCreatorId = upload.userId,
                            uploadSenderId = updatedByUser.id,
                            messageId = null,
                            createdAt = ZonedDateTime.now(),
                            uploadId = upload.id
                    )
                }
                chatUploadsIds.addAll(newChatUploads.map { it.id })
            }

            var emojiInfo = message.emoji
            val initialMentionedUsers = message.mentionedUsers
            var mentionedUsers = initialMentionedUsers
            var newMentionedChatParticipants = listOf<ChatParticipation>()
            var unmentionedChatParticipants = listOf<ChatParticipation>()

            if (message.text != updateMessageRequest.text) {
                val textInfo = textParser.parseText(
                        text = updateMessageRequest.text,
                        emojiSet = updateMessageRequest.emojisSet
                )
                        .awaitFirst()
                emojiInfo = textInfo.emoji
                val mentionedUsersIdsOrSlugs = textInfo.userLinks
                        .userLinksPositions
                        .map { userLink -> userLink.userIdOrSlug }
                val (mentionedChatParticipants, mentionedUsersIds) = mapTo2Lists(
                        chatParticipationRepository.findByChatIdAndUserIdOrSlugIn(
                                chatId = message.chatId,
                                userIdsOrSlugs = mentionedUsersIdsOrSlugs,
                                excludedUsersIds = listOf(updatedByUser.id)
                        )
                                .collectList()
                                .awaitFirst(),
                        { chatParticipation -> chatParticipation },
                        { chatParticipation -> chatParticipation.user.id }
                )
                mentionedUsers = mentionedUsersIds
                newMentionedChatParticipants = mentionedChatParticipants
                        .filter { chatParticipation -> !initialMentionedUsers.contains(chatParticipation.user.id) }

                val unmentionedUsersIds = initialMentionedUsers.filter { userId -> !mentionedUsersIds.contains(userId) }

                if (unmentionedUsersIds.isNotEmpty()) {
                    unmentionedChatParticipants = chatParticipationRepository.findByChatIdAndUserIdInAndDeletedFalse(
                            chatId = message.chatId,
                            userIds = unmentionedUsersIds,
                    )
                            .collectList()
                            .awaitFirst()
                }
            }

            val updatedMessage = messageMapper.mapMessageUpdate(
                    updateMessageRequest = updateMessageRequest,
                    originalMessage = message,
                    uploads = attachments,
                    chatUploadsIds = chatUploadsIds,
                    emojis = emojiInfo,
                    mentionedUsers = mentionedUsers
            )

            return@mono MessageUpdateResult<T>(
                    initialMessage = message,
                    updatedMessage = updatedMessage,
                    newChatUploadAttachments = newChatUploads ?: listOf<ChatUploadAttachment<*>>(),
                    chatUploadsAttachmentsToRemove = chatUploadsToRemove ?: listOf<ChatUploadAttachment<*>>(),
                    newMentionedChatParticipants = newMentionedChatParticipants,
                    unmentionedChatParticipants = unmentionedChatParticipants
            )
        }
    }

    override fun deleteMessage(id: String, chatId: String): Mono<Unit> {
        return mono {
            val message = findMessageEntityById(id).awaitFirst()
            val uploadsIds = message.attachments.map { upload -> upload.id }

            messageEntityService.deleteMessage(message).awaitFirstOrNull()

            if (uploadsIds.isNotEmpty()) {
                val uploadsAttachments = chatUploadAttachmentRepository
                        .findByUploadIdIn(uploadsIds)
                        .collectList()
                        .awaitFirst()
                chatUploadAttachmentEntityService.deleteChatUploadAttachments(uploadsAttachments)
                        .awaitFirstOrNull()
            }

            return@mono
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

    override fun findMessageByIdAndChatId(id: String, chatId: String): Mono<MessageResponse> {
        return messageRepository
                .findByIdAndChatId(id, chatId)
                .switchIfEmpty(Mono.error(MessageNotFoundException("Could not find message with id $id and chat id $chatId")))
                .flatMap { message -> messageMapper.toMessageResponse(
                        message = message,
                        mapReferredMessage = true,
                        readByCurrentUser = true
                ) }
    }

    override fun findMessagesByChat(chatId: String, paginationRequest: PaginationRequest): Flux<MessageResponse> {
        return mono {
            val chat = findChatById(chatId).awaitFirst()
            val currentUser = authenticationHolder.currentUserDetails.awaitFirstOrNull()
            val messages = messageRepository.findByChatId(chat.id, paginationRequest.toPageRequest())
            val unreadMessagesCount = if (currentUser != null) {
                unreadMessagesCountRepository.findByChatIdAndUserId(chatId, currentUser.id).awaitFirstOrNull()
            } else {
                null
            }

            return@mono mapMessages(messages, unreadMessagesCount, chat.lastMessageReadByAnyoneCreatedAt)
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
            val currentUser = authenticationHolder.currentUserDetails.awaitFirstOrNull()
            val messages = messageRepository.findByChatIdAndCreatedAtGreaterThanEqual(
                    chatId = chat.id,
                    date = cursorMessage.createdAt,
                    pageable = paginationRequest.toPageRequest()
            )
            val unreadMessagesCount = if (currentUser != null) {
                unreadMessagesCountRepository.findByChatIdAndUserId(chatId, currentUser.id).awaitFirstOrNull()
            } else {
                null
            }

            return@mono mapMessages(messages, unreadMessagesCount, chat.lastMessageReadByAnyoneCreatedAt)
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
            val currentUser = authenticationHolder.currentUserDetails.awaitFirstOrNull()
            val messages = messageRepository.findByChatIdAndCreatedAtLessThanEqual(
                    chatId = chat.id,
                    date = cursorMessage.createdAt,
                    pageable = paginationRequest.toPageRequest()
            )
            val unreadMessagesCount = if (currentUser != null) {
                unreadMessagesCountRepository.findByChatIdAndUserId(chatId, currentUser.id).awaitFirstOrNull()
            } else {
                null
            }

            return@mono mapMessages(messages, unreadMessagesCount, chat.lastMessageReadByAnyoneCreatedAt)
        }
                .flatMapMany { it }
    }

    private fun mapMessages(
            messages: Flux<Message>,
            unreadMessagesCount: UnreadMessagesCount?,
            lastReadMessageCreatedAt: ZonedDateTime?
    ): Flux<MessageResponse> {
        return messageMapper.mapMessages(messages, unreadMessagesCount, lastReadMessageCreatedAt)
    }

    override fun pinMessage(id: String, chatId: String): Mono<MessageResponse> {
        return mono {
            if (messageRepository.findByPinnedTrueAndChatId(chatId).awaitFirstOrNull() != null) {
                throw ChatAlreadyHasPinnedMessageException("Chat $chatId already has pinned message")
            }

            var message = findMessageEntityById(id).awaitFirst()
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()

            message = message.copy(pinnedAt = ZonedDateTime.now(), pinned = true, pinnedById = currentUser.id)
            messageRepository.save(message).awaitFirst()

            val messageResponse = messageMapper.toMessageResponse(
                    message = message,
                    mapReferredMessage = true,
                    readByCurrentUser = true,
                    readByAnyone = true
            )
                    .awaitFirst()

            Mono.fromRunnable<Unit>{ chatEventsPublisher.messagePinned(messageResponse) }.subscribe()

            return@mono messageResponse
        }
    }

    override fun unpinMessage(id: String, chatId: String): Mono<MessageResponse> {
        return mono {
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

    private fun findChatById(chatId: String): Mono<Chat> {
        return mono {
            val chat = chatCacheWrapper.findById(chatId).awaitFirstOrNull()
                    ?: throw ChatNotFoundException("Could not find chat with id $chatId")

            if (chat.deleted) {
                throw ChatDeletedException(chat.chatDeletion)
            }

            return@mono chat
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

            return@mono message
        }
    }

    override fun deleteMultipleMessages(deleteMultipleMessagesRequest: DeleteMultipleMessagesRequest): Mono<Unit> {
        return mono {
            val messages = messageRepository.findAllById(deleteMultipleMessagesRequest.messagesIds)
                    .collectList()
                    .awaitFirst()

            messageEntityService.deleteMultipleMessages(messages).awaitFirstOrNull()

            val (messagesIds, uploadAttachmentsIds) = mapTo2Lists(
                    messages,
                    { message -> message.id },
                    { message -> message.uploadAttachmentsIds }
            )
                    .map { (messagesIds, attachmentsIds) -> NTuple2(
                            messagesIds,
                            attachmentsIds.flatten()
                    ) }
            val chatUploadAttachments = chatUploadAttachmentRepository
                    .findAllById(uploadAttachmentsIds)
                    .collectList()
                    .awaitFirst()
            chatUploadAttachmentEntityService.deleteChatUploadAttachmentsAndUpdateRelatedMessages(
                    chatUploadAttachments = chatUploadAttachments,
                    messagesIdsToSkip = messagesIds
            )
                    .awaitFirstOrNull()

            return@mono
        }
    }
}
