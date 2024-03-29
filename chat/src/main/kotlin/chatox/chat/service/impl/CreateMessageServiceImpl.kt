package chatox.chat.service.impl

import chatox.chat.api.request.CreateMessageRequest
import chatox.chat.api.request.ForwardMessagesRequest
import chatox.chat.api.response.MessageResponse
import chatox.chat.config.CacheWrappersConfig
import chatox.chat.exception.ForwardingFromDialogsIsNotAllowedException
import chatox.chat.exception.ForwardingFromMultipleChatsIsNotAllowedException
import chatox.chat.exception.MessageNotFoundException
import chatox.chat.exception.MessageValidationException
import chatox.chat.exception.metadata.ChatDeletedException
import chatox.chat.exception.metadata.ChatNotFoundException
import chatox.chat.exception.metadata.LimitOfScheduledMessagesReachedException
import chatox.chat.exception.metadata.ScheduledMessageIsTooCloseToAnotherScheduledMessageException
import chatox.chat.exception.metadata.StickerNotFoundException
import chatox.chat.mapper.MessageMapper
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.Chat
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatType
import chatox.chat.model.ChatUploadAttachment
import chatox.chat.model.EmojiInfo
import chatox.chat.model.Message
import chatox.chat.model.ScheduledMessage
import chatox.chat.model.Sticker
import chatox.chat.model.Upload
import chatox.chat.model.User
import chatox.chat.repository.mongodb.ChatMessagesCounterRepository
import chatox.chat.repository.mongodb.ChatParticipationRepository
import chatox.chat.repository.mongodb.ChatRepository
import chatox.chat.repository.mongodb.ChatUploadAttachmentRepository
import chatox.chat.repository.mongodb.MessageMongoRepository
import chatox.chat.repository.mongodb.ScheduledMessageRepository
import chatox.chat.repository.mongodb.StickerRepository
import chatox.chat.repository.mongodb.UploadRepository
import chatox.chat.service.ChatUploadAttachmentEntityService
import chatox.chat.service.CreateMessageService
import chatox.chat.service.EmojiParserService
import chatox.chat.service.MessageEntityService
import chatox.chat.service.MessageReadService
import chatox.chat.util.NTuple6
import chatox.chat.util.NTuple7
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
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
import java.time.temporal.ChronoUnit
import java.util.UUID

@Service
class CreateMessageServiceImpl(
        private val messageRepository: MessageMongoRepository,
        private val scheduledMessageRepository: ScheduledMessageRepository,
        private val chatMessagesCounterRepository: ChatMessagesCounterRepository,
        private val uploadRepository: UploadRepository,
        private val stickerRepository: StickerRepository,
        private val chatParticipationRepository: ChatParticipationRepository,
        private val chatUploadAttachmentRepository: ChatUploadAttachmentRepository,
        private val chatRepository: ChatRepository,

        @Qualifier(CacheWrappersConfig.CHAT_BY_ID_CACHE_WRAPPER)
        private val chatCacheWrapper: ReactiveRepositoryCacheWrapper<Chat, String>,
        private val messageEntityService: MessageEntityService,
        private val chatUploadAttachmentEntityService: ChatUploadAttachmentEntityService,
        private val emojiParserService: EmojiParserService,
        private val messageReadService: MessageReadService,
        private val authenticationHolder: ReactiveAuthenticationHolder<User>,
        private val messageMapper: MessageMapper,
        private val chatEventsPublisher: ChatEventsPublisher
) : CreateMessageService {
    internal companion object {
        const val ALLOWED_NUMBER_OF_SCHEDULED_MESSAGES = 50
    }

    override fun createMessage(chatId: String, createMessageRequest: CreateMessageRequest): Mono<MessageResponse> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()

            return@mono if (createMessageRequest.scheduledAt == null) {
                createNormalMessage(chatId, createMessageRequest, currentUser).awaitFirst()
            } else {
                createScheduledMessage(chatId, createMessageRequest, currentUser).awaitFirst()
            }
        }
    }

    private fun createNormalMessage(chatId: String, createMessageRequest: CreateMessageRequest, currentUser: JwtPayload): Mono<MessageResponse> {
        return mono {
            val message = createMessageFromRequest(chatId, createMessageRequest, currentUser).awaitFirst()
            val response = messageMapper.toMessageCreated(
                    message = message,
                    readByCurrentUser = true,
                    mapReferredMessage = true
            )
                    .awaitFirst()

            Mono.fromRunnable<Void>{ chatEventsPublisher.messageCreated(response) }.subscribe()

            return@mono response.toMessageResponse()
        }
    }

    private fun createScheduledMessage(chatId: String, createMessageRequest: CreateMessageRequest, currentUser: JwtPayload): Mono<MessageResponse> {
        return mono {
            val numberOfScheduledMessagesInChat = scheduledMessageRepository.countByChatId(chatId).awaitFirst()

            if (numberOfScheduledMessagesInChat >= ALLOWED_NUMBER_OF_SCHEDULED_MESSAGES) {
                throw LimitOfScheduledMessagesReachedException(
                        "Limit of scheduled messages is reached",
                        ALLOWED_NUMBER_OF_SCHEDULED_MESSAGES
                )
            }

            val numberOfMessagesScheduledCloseToThisMessage = scheduledMessageRepository.countByChatIdAndScheduledAtBetween(
                    chatId = chatId,
                    scheduledAtFrom = createMessageRequest.scheduledAt!!.minusMinutes(10L),
                    scheduledAtTo = createMessageRequest.scheduledAt!!.plusMinutes(10L)
            )
                    .awaitFirst()

            if (numberOfMessagesScheduledCloseToThisMessage != 0L) {
                throw ScheduledMessageIsTooCloseToAnotherScheduledMessageException(
                        "This scheduled message is too close to another scheduled message. " +
                                "Scheduled messages must be at least 10 minutes from each other"
                )
            }

            val (
                    chat,
                    sticker,
                    referredMessage,
                    emoji,
                    uploadAttachments,
                    uploads,
                    chatParticipation
            ) = prepareDataForSavingMessage(chatId, createMessageRequest, currentUser).awaitFirst()

            val scheduledMessage = ScheduledMessage(
                    id = UUID.randomUUID().toString(),
                    createdAt = ZonedDateTime.now(),
                    chatId = chat.id,
                    referredMessageId = referredMessage?.id,
                    text = createMessageRequest.text,
                    senderId = currentUser.id,
                    emoji = emoji,
                    attachments = uploads,
                    uploadAttachmentsIds = uploadAttachments.map { attachment -> attachment.id },
                    scheduledAt = createMessageRequest.scheduledAt.truncatedTo(ChronoUnit.MINUTES),
                    sticker = sticker,
                    chatParticipationId = chatParticipation.id
            )
            scheduledMessageRepository.save(scheduledMessage).awaitFirst()

            val messageResponse = messageMapper.toMessageResponse(
                    message = scheduledMessage,
                    mapReferredMessage = true,
                    readByCurrentUser = true
            )
                    .awaitFirst()
            Mono.fromRunnable<Void> { chatEventsPublisher.scheduledMessageCreated(messageResponse) }.subscribe()

            return@mono messageResponse
        }
    }

    override fun createFirstMessageForPrivateChat(chatId: String, createMessageRequest: CreateMessageRequest, chatParticipation: ChatParticipation): Mono<MessageResponse> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val message = createMessageFromRequest(
                    chatId,
                    createMessageRequest,
                    currentUser,
                    chatParticipation
            ).awaitFirst()

            return@mono messageMapper.toMessageResponse(
                    message = message,
                    mapReferredMessage = true,
                    readByCurrentUser = true
            )
                    .awaitFirst()
        }
    }

    override fun forwardMessages(chatId: String, forwardMessagesRequest: ForwardMessagesRequest): Flux<MessageResponse> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val targetChat = chatCacheWrapper.findById(chatId)
                    .awaitFirstOrNull()
                    ?: throw ChatNotFoundException("Could not find chat with id $chatId")

            val messages = messageRepository
                    .findAllByIdInOrderByCreatedAtAsc(forwardMessagesRequest.forwardedMessagesIds)
                    .collectList()
                    .awaitFirst()

            if (messages.size != forwardMessagesRequest.forwardedMessagesIds.size) {
                throw MessageNotFoundException("Some of the messages could not be found")
            }

            val chatsIds = messages.map { message -> message.chatId }.toSet()

            if (chatsIds.size != 1) {
                throw ForwardingFromMultipleChatsIsNotAllowedException("Forwarding from multiple chats is not allowed")
            }

            val forwardedFromChat = chatCacheWrapper.findById(chatsIds.first()).awaitFirst()

            if (forwardedFromChat.type == ChatType.DIALOG
                    && forwardedFromChat.dialogDisplay
                            .none { dialogDisplay -> dialogDisplay.userId == currentUser.id }) {
                throw ForwardingFromDialogsIsNotAllowedException(
                        "Cannot forward from dialog is current user is not participant of the dialog"
                )
            }

            val otherSourceChatsIds = messages
                    .filter { message -> message.forwardedFromChatId != null }
                    .map { message -> message.forwardedFromChatId!! }
            val chatsMap = mutableMapOf(Pair(forwardedFromChat.id, forwardedFromChat))

            if (otherSourceChatsIds.isNotEmpty()) {
                val otherSourceChats = chatCacheWrapper.findByIds(otherSourceChatsIds).collectList().awaitFirst()
                otherSourceChats.forEach { chat -> chatsMap[chat.id] = chat }
            }

            val chatParticipationsMap = chatParticipationRepository
                    .findByChatIdInAndUserId(chatsMap.keys, currentUser.id)
                    .collectList()
                    .awaitFirst()
                    .associateBy { chatParticipation -> chatParticipation.chatId }
            val chatParticipationInCurrentChat = chatParticipationRepository.findByChatIdAndUserId(
                    chatId = chatId,
                    userId = currentUser.id
            )
                    .awaitFirst()

            val nextCounterValue = chatMessagesCounterRepository
                    .increaseCounterValue(chatId, messages.size.toLong())
                    .awaitFirst()
            val startCounterValue = nextCounterValue - messages.size
            val copiedMessages = mutableListOf<Message>()
            val copiedChatUploadAttachments = mutableListOf<ChatUploadAttachment<*>>()

            messages.zip(messages.indices).forEach { (message, index) ->
                val messageId = UUID.randomUUID().toString()
                val chatUploadAttachments = message.attachments.map { upload -> ChatUploadAttachment(
                        id = UUID.randomUUID().toString(),
                        chatId = chatId,
                        upload = upload,
                        type = upload.type,
                        uploadCreatorId = upload.userId,
                        uploadSenderId = currentUser.id,
                        messageId = messageId,
                        createdAt = ZonedDateTime.now(),
                        uploadId = upload.id
                ) }
                val sourceChatId = message.forwardedFromChatId ?: forwardedFromChat.id
                val copiedMessage = message.copy(
                        id = messageId,
                        chatId = chatId,
                        forwardedFromChatId = message.forwardedFromChatId ?: forwardedFromChat.id,
                        forwardedFromMessageId = message.forwardedFromMessageId ?: message.id,
                        forwardedFromDialogChatType = chatsMap[sourceChatId]?.type,
                        chatParticipationIdInSourceChat = chatParticipationsMap[sourceChatId]?.id,
                        forwardedById = currentUser.id,
                        createdAt = ZonedDateTime.now(),
                        updatedAt = null,
                        attachments = message.attachments,
                        uploadAttachmentsIds = chatUploadAttachments.map { attachment -> attachment.id },
                        index = startCounterValue + index,
                        chatParticipationId = chatParticipationInCurrentChat.id
                )

                copiedMessages.add(copiedMessage)
                copiedChatUploadAttachments.addAll(chatUploadAttachments)
            }

            messageRepository.saveAll(copiedMessages).awaitFirst()

            if (copiedChatUploadAttachments.isNotEmpty()) {
                chatUploadAttachmentRepository.saveAll(copiedChatUploadAttachments).awaitFirst()
            }

            val lastMessage = copiedMessages.last()

            chatRepository.save(targetChat.copy(
                    lastMessageId = lastMessage.id,
                    lastMessageDate = lastMessage.createdAt
            ))
                    .awaitFirst()

            messageReadService
                    .increaseUnreadMessagesCountForChat(chatId, copiedMessages.size.toLong(), listOf(chatParticipationInCurrentChat.id))
                    .awaitFirst()
            messageReadService.readAllMessagesForCurrentUser(chatParticipationInCurrentChat, lastMessage).awaitFirst()

            return@mono messageMapper.mapMessages(Flux.fromIterable(copiedMessages))
        }
                .flatMapMany { it }
    }

    private fun createMessageFromRequest(
            chatId: String,
            createMessageRequest: CreateMessageRequest,
            currentUser: JwtPayload,
            providedChatParticipation: ChatParticipation? = null
    ): Mono<Message> {
        return mono {
            val (
                    chat,
                    sticker,
                    referredMessage,
                    emoji,
                    uploadAttachments,
                    uploads,
                    chatParticipation
            ) = prepareDataForSavingMessage(chatId, createMessageRequest, currentUser, providedChatParticipation).awaitFirst()

            val messageIndex = chatMessagesCounterRepository.getNextCounterValue(chat).awaitFirst()
            val message = Message(
                    id = UUID.randomUUID().toString(),
                    text = createMessageRequest.text,
                    chatId = chat.id,
                    senderId = currentUser.id,
                    chatParticipationId = chatParticipation.id,
                    sticker = sticker,
                    attachments = uploads,
                    uploadAttachmentsIds = uploadAttachments.map { attachment -> attachment.id },
                    createdAt = ZonedDateTime.now(),
                    index = messageIndex,
                    emoji = emoji,
                    referredMessageId = referredMessage?.id
            )

            messageRepository.save(message).awaitFirst()
            messageReadService.increaseUnreadMessagesCountForChat(chat.id, listOf(chatParticipation.id)).awaitFirst()
            messageReadService.readAllMessagesForCurrentUser(chatParticipation, message).awaitFirst()

            if (uploadAttachments.isNotEmpty()) {
                chatUploadAttachmentEntityService.linkChatUploadAttachmentsToMessage(uploadAttachments, message)
                        .collectList()
                        .awaitFirst()
            }

            return@mono message
        }
    }

    private fun prepareDataForSavingMessage(
            chatId: String,
            createMessageRequest: CreateMessageRequest,
            currentUser: JwtPayload,
            chatParticipation: ChatParticipation? = null
    ): Mono<NTuple7<Chat, Sticker<Any>?, Message?, EmojiInfo, List<ChatUploadAttachment<Any>>, List<Upload<Any>>, ChatParticipation>> {
        return mono {
            val baseData = prepareBaseDataForSavingMessage(chatId, createMessageRequest, currentUser).awaitFirst()
            val returnedTypeParticipation = chatParticipation
                    ?: chatParticipationRepository.findByChatIdAndUserIdAndDeletedFalse(
                            chatId = chatId,
                            userId = currentUser.id
                    )
                            .awaitFirst()

            return@mono NTuple7(baseData.t1, baseData.t2, baseData.t3, baseData.t4, baseData.t5, baseData.t6, returnedTypeParticipation)
        }
    }

    private fun prepareBaseDataForSavingMessage(
            chatId: String,
            createMessageRequest: CreateMessageRequest,
            currentUser: JwtPayload
    ): Mono<NTuple6<Chat, Sticker<Any>?, Message?, EmojiInfo, List<ChatUploadAttachment<Any>>, List<Upload<Any>>>> {
        return mono {
            val chat = findChatById(chatId).awaitFirst()

            if (chat.deleted) {
                throw ChatDeletedException(chat.chatDeletion)
            }

            var sticker: Sticker<Any>? = null

            if (createMessageRequest.stickerId != null) {
                if (createMessageRequest.text.isNotBlank() || createMessageRequest.uploadAttachments.isNotEmpty()) {
                    throw MessageValidationException("Message cannot contain text or attachments if it has sticker")
                }

                sticker = findStickerById(createMessageRequest.stickerId).awaitFirst()
            }

            var referredMessage: Message? = null

            if (createMessageRequest.referredMessageId != null) {
                referredMessage = messageEntityService.findMessageEntityById(createMessageRequest.referredMessageId)
                        .awaitFirst()
            }

            val emoji = if (createMessageRequest.text.isNotBlank()) {
                emojiParserService.parseEmoji(
                        text = createMessageRequest.text,
                        emojiSet = createMessageRequest.emojisSet
                )
                        .awaitFirst()
            } else {
                EmojiInfo()
            }
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

            return@mono NTuple6(chat, sticker, referredMessage, emoji, uploadAttachments, uploads)
        }
    }

    private fun findChatById(id: String) = chatCacheWrapper
            .findById(id)
            .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $id")))

    private fun findStickerById(id: String) = stickerRepository
            .findById(id)
            .switchIfEmpty(Mono.error(StickerNotFoundException("Could not find sticker with id $id")))
}