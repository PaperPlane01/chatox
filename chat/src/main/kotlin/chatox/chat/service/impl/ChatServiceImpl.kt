package chatox.chat.service.impl

import chatox.chat.api.request.CreateChatRequest
import chatox.chat.api.request.CreatePrivateChatRequest
import chatox.chat.api.request.DeleteChatRequest
import chatox.chat.api.request.DeleteChatRequestWithChatId
import chatox.chat.api.request.DeleteMultipleChatsRequest
import chatox.chat.api.request.UpdateChatRequest
import chatox.chat.api.response.AvailabilityResponse
import chatox.chat.api.response.ChatOfCurrentUserResponse
import chatox.chat.api.response.ChatResponse
import chatox.chat.api.response.ChatResponseWithCreatorId
import chatox.chat.exception.InvalidChatDeletionCommentException
import chatox.chat.exception.InvalidChatDeletionReasonException
import chatox.chat.exception.SlugIsAlreadyInUseException
import chatox.chat.exception.UploadNotFoundException
import chatox.chat.exception.UserNotFoundException
import chatox.chat.exception.metadata.ChatDeletedException
import chatox.chat.exception.metadata.ChatNotFoundException
import chatox.chat.mapper.ChatMapper
import chatox.chat.mapper.ChatParticipationMapper
import chatox.chat.messaging.rabbitmq.event.ChatDeleted
import chatox.chat.messaging.rabbitmq.event.PrivateChatCreated
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.Chat
import chatox.chat.model.ChatDeletion
import chatox.chat.model.ChatDeletionReason
import chatox.chat.model.ChatMessagesCounter
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatRole
import chatox.chat.model.ChatType
import chatox.chat.model.ImageUploadMetadata
import chatox.chat.model.Message
import chatox.chat.model.Upload
import chatox.chat.model.UploadType
import chatox.chat.model.User
import chatox.chat.repository.ChatMessagesCounterRepository
import chatox.chat.repository.ChatParticipationRepository
import chatox.chat.repository.ChatRepository
import chatox.chat.repository.MessageRepository
import chatox.chat.repository.UploadRepository
import chatox.chat.security.AuthenticationFacade
import chatox.chat.service.ChatService
import chatox.chat.service.MessageService
import chatox.chat.support.UserDisplayedNameHelper
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.log.LogExecution
import chatox.platform.pagination.PaginationRequest
import chatox.platform.time.TimeService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.bson.types.ObjectId
import org.slf4j.LoggerFactory
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.util.ObjectUtils
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime
import java.util.UUID

@Service
@Transactional
@LogExecution
class ChatServiceImpl(private val chatRepository: ChatRepository,
                      private val chatParticipationRepository: ChatParticipationRepository,
                      private val messageRepository: MessageRepository,
                      private val uploadRepository: UploadRepository,
                      private val chatMessagesCounterRepository: ChatMessagesCounterRepository,
                      private val messageCacheWrapper: ReactiveRepositoryCacheWrapper<Message, String>,
                      private val userCacheWrapper: ReactiveRepositoryCacheWrapper<User, String>,
                      private val chatMapper: ChatMapper,
                      private val chatParticipationMapper: ChatParticipationMapper,
                      private val authenticationFacade: AuthenticationFacade,
                      private val chatEventsPublisher: ChatEventsPublisher,
                      private val timeService: TimeService,
                      private val messageService: MessageService,
                      private val userDisplayedNameHelper: UserDisplayedNameHelper) : ChatService {
    private val log = LoggerFactory.getLogger(this.javaClass)

    override fun createChat(createChatRequest: CreateChatRequest): Mono<ChatOfCurrentUserResponse> {
        return mono {
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val chat = chatMapper.fromCreateChatRequest(
                    createChatRequest = createChatRequest,
                    currentUser = currentUser
            )
            val chatMessagesCounter = ChatMessagesCounter(
                    id = UUID.randomUUID().toString(),
                    chatId = chat.id,
                    messagesCount = 0L
            )
            chatMessagesCounterRepository.save(chatMessagesCounter).awaitFirst()
            chatRepository.save(chat).awaitFirst()

            var creatorDisplayedName = currentUser.firstName

            if (currentUser.lastName != null) {
                creatorDisplayedName = "$creatorDisplayedName ${currentUser.lastName}"
            }

            val creatorChatParticipation = chatParticipationRepository.save(
                    chatParticipation = ChatParticipation(
                            user = currentUser,
                            chatId = chat.id,
                            role = ChatRole.ADMIN,
                            createdAt = timeService.now(),
                            userDisplayedName = creatorDisplayedName
                    )
            )
                    .awaitFirst()
            chatEventsPublisher.userJoinedChat(chatParticipationMapper.toChatParticipationResponse(creatorChatParticipation))

            chatMapper.toChatOfCurrentUserResponse(
                    chat = chat,
                    chatParticipation = creatorChatParticipation,
                    unreadMessagesCount = 0,
                    lastMessage = null as Message?,
                    lastReadMessage = null as Message?,
                    onlineParticipantsCount = 1
            )
                    .awaitFirst()
        }
    }

    override fun createPrivateChat(createPrivateChatRequest: CreatePrivateChatRequest): Mono<ChatOfCurrentUserResponse> {
        return mono {
            val user = userCacheWrapper.findById(createPrivateChatRequest.userId).awaitFirstOrNull()
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()

            if (user == null) {
                throw UserNotFoundException("Could not find user with id ${createPrivateChatRequest.userId}")
            }

            val chatId = UUID.randomUUID().toString()
            val chat = Chat(
                    id = chatId,
                    createdById = currentUser.id,
                    createdAt = ZonedDateTime.now(),
                    type = ChatType.DIALOG,
                    name = "dialog-${currentUser.id}-${user.id}",
                    deleted = false,
                    numberOfParticipants = 2,
                    numberOfOnlineParticipants = 0,
                    slug = chatId
            )

            chatRepository.save(chat).awaitFirst()

            val chatMessagesCounter = ChatMessagesCounter(
                    id = UUID.randomUUID().toString(),
                    chatId = chatId,
                    messagesCount = 1L
            )
            chatMessagesCounterRepository.save(chatMessagesCounter).awaitFirst()

            val message = messageService.createFirstMessageForPrivateChat(chatId, createPrivateChatRequest.message).awaitFirst()

            val currentUserChatParticipation = ChatParticipation(
                    id = ObjectId().toHexString(),
                    chatId = chatId,
                    deleted = false,
                    createdAt = ZonedDateTime.now(),
                    user = currentUser,
                    role = ChatRole.USER,
                    chatDeleted = false,
                    userOnline = currentUser.online ?: false,
                    userDisplayedName = userDisplayedNameHelper.getDisplayedName(currentUser),
                    lastReadMessageId = message.id
            )
            val otherUserChatParticipation = ChatParticipation(
                    id = ObjectId().toHexString(),
                    chatId = chatId,
                    deleted = false,
                    createdAt = ZonedDateTime.now(),
                    user = user,
                    role = ChatRole.USER,
                    chatDeleted = false,
                    userOnline = user.online ?: false,
                    userDisplayedName = userDisplayedNameHelper.getDisplayedName(user)
            )

            val chatParticipations = mutableListOf(currentUserChatParticipation, otherUserChatParticipation)
            chatParticipationRepository.saveAll(chatParticipations).collectList().awaitFirst()

            chatRepository.save(chat.copy(
                    lastMessageId = message.id,
                    lastMessageDate = message.createdAt
            )).awaitFirst()

            val privateChatCreated = PrivateChatCreated(
                    id = chat.id,
                    chatParticipations = chatParticipations.map { chatParticipation -> chatParticipationMapper.toChatParticipationResponse(chatParticipation) },
                    message = message
            )
            chatEventsPublisher.privateChatCreated(privateChatCreated)

            return@mono chatMapper.toChatOfCurrentUserResponse(
                    chat = chat,
                    chatParticipation = currentUserChatParticipation,
                    lastMessage = message,
                    lastReadMessage = message,
                    unreadMessagesCount =  0L,
                    onlineParticipantsCount = 0,
                    user = user
            )
                    .awaitFirst()
        }
    }

    override fun updateChat(id: String, updateChatRequest: UpdateChatRequest): Mono<ChatResponse> {
        return mono {
            var chat = findChatByIdInternal(id).awaitFirst()

            if (chat.deleted) {
                throw ChatDeletedException(chat.chatDeletion)
            }

            if (updateChatRequest.slug != null
                    && updateChatRequest.slug != chat.slug
                    && updateChatRequest.slug != chat.id) {
                val slugAvailability = checkChatSlugAvailability(updateChatRequest.slug).awaitFirst()

                if (!slugAvailability.available) {
                    throw SlugIsAlreadyInUseException(
                            "Slug ${updateChatRequest.slug} is already used by another chat"
                    )
                }
            }

            var avatar: Upload<ImageUploadMetadata>? = chat.avatar

            if (updateChatRequest.avatarId != null) {
                avatar = uploadRepository.findByIdAndType<ImageUploadMetadata>(
                        updateChatRequest.avatarId,
                        UploadType.IMAGE
                )
                        .awaitFirstOrNull()

                if (avatar == null) {
                    throw UploadNotFoundException("Could not find image with id ${updateChatRequest.avatarId}")
                }
            }

            chat = chat.copy(
                    name = updateChatRequest.name,
                    avatar = avatar,
                    slug = updateChatRequest.slug ?: chat.id,
                    tags = updateChatRequest.tags ?: arrayListOf(),
                    description = updateChatRequest.description
            )

            chat = chatRepository.save(chat).awaitFirst()
            val chatUpdatedEvent = chatMapper.toChatUpdated(chat)
            chatEventsPublisher.chatUpdated(chatUpdatedEvent)

            chatMapper.toChatResponse(chat)
        }
    }

    override fun deleteChat(id: String, deleteChatRequest: DeleteChatRequest?): Mono<Void> {
        return mono {
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            var chat = chatRepository.findById(id).awaitFirst()

            val chatDeletion: ChatDeletion? = null

            if (currentUser.id != chat.createdById) {
                log.debug("Chat $id is deleted not by its creator")
                log.trace("Current user id is ${currentUser.id}")
                log.trace("Chat creator id is ${chat.createdById}")

                if (deleteChatRequest == null) {
                    throw InvalidChatDeletionReasonException(
                            "Chat deletion reason must be specified if chat is deleted not by its creator"
                    )
                }

                if (deleteChatRequest.reason == ChatDeletionReason.OTHER
                        && ObjectUtils.isEmpty(deleteChatRequest.comment)) {
                    throw InvalidChatDeletionCommentException(
                            "Chat deletion comment must be specified if chat deletion reason is ${ChatDeletionReason.OTHER}"
                    )
                }
            }

            chat = chat.copy(
                    deleted = true,
                    deletedAt = timeService.now(),
                    deletedById = currentUser.id,
                    chatDeletion = chatDeletion
            )
            chatRepository.save(chat).awaitFirst()
            chatParticipationRepository.updateChatDeleted(
                    chatId = id,
                    chatDeleted = true
            )
                    .awaitFirst()
            chatEventsPublisher.chatDeleted(
                    ChatDeleted(
                            id = id,
                            reason = chatDeletion?.deletionReason,
                            comment = chatDeletion?.comment
                    )
            )

            Mono.empty<Void>()
        }
                .flatMap { it }
    }

    override fun findChatBySlugOrId(slugOrId: String): Mono<ChatResponse> {
        return mono {
            val chat = chatRepository.findByIdEqualsOrSlugEquals(slugOrId, slugOrId).awaitFirstOrNull()
                    ?: throw ChatNotFoundException("Could not find chat with id or slug $slugOrId")

            if (chat.deleted) {
                throw ChatDeletedException(chat.chatDeletion)
            }

            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            var otherUser: User? = null

            if (chat.type == ChatType.DIALOG) {
                val chatParticipants = chatParticipationRepository.findByChatId(chat.id).collectList().awaitFirst()
                chatParticipants.firstOrNull { chatParticipation -> chatParticipation.user.id == currentUser.id }
                        ?: throw AccessDeniedException("Current user cannot access this chat")
                val otherUserChatParticipation = chatParticipants.firstOrNull { chatParticipation -> chatParticipation.user.id != currentUser.id }

                otherUser = if (otherUserChatParticipation != null) {
                    userCacheWrapper.findById(otherUserChatParticipation.user.id).awaitFirst()
                } else {
                    currentUser
                }
            }

            chatMapper.toChatResponse(
                    chat = chat,
                    currentUserId = currentUser.id,
                    user = otherUser
            )
        }
    }

    override fun searchChats(query: String, paginationRequest: PaginationRequest): Flux<ChatResponse> {
        return chatRepository
                .searchChats(query, listOf(ChatType.GROUP), paginationRequest.toPageRequest())
                .map { chat -> chatMapper.toChatResponse(chat) }
    }

    override fun getChatsOfCurrentUser(): Flux<ChatOfCurrentUserResponse> {
        return mono {
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val chatParticipations = chatParticipationRepository
                    .findAllByUserIdAndDeletedFalse(currentUser.id)
                    .collectList()
                    .awaitFirst()
            val unreadMessagesMap: MutableMap<String, Long> = HashMap()

            chatParticipations.forEach { chatParticipation ->
                unreadMessagesMap[chatParticipation.chatId] = countUnreadMessages(chatParticipation)
                        .awaitFirst()
            }

            chatParticipations.map { chatParticipation ->
                val chat = findChatByIdInternal(chatParticipation.chatId, true).awaitFirst()
                val lastReadMessage = if (chatParticipation.lastReadMessageId != null) {
                    messageCacheWrapper.findById(chatParticipation.lastReadMessageId!!).awaitFirst()
                } else null

                val lastMessage = if (chat.lastMessageId != null) {
                    messageCacheWrapper.findById(chat.lastMessageId!!).awaitFirst()
                } else null

                val user = if (chat.type == ChatType.DIALOG) {
                    val chatParticipants = chatParticipationRepository.findByChatIdAndDeletedFalse(chat.id).collectList().awaitFirst()
                    val otherUserId = chatParticipants.filter { chatParticipant -> chatParticipant.user.id != currentUser.id }[0].user.id

                    userCacheWrapper.findById(otherUserId).awaitFirst()
                } else null

                chatMapper.toChatOfCurrentUserResponse(
                        chat = chat,
                        chatParticipation = chatParticipation,
                        lastReadMessage = lastReadMessage,
                        lastMessage = lastMessage,
                        onlineParticipantsCount = chat.numberOfOnlineParticipants,
                        unreadMessagesCount = unreadMessagesMap[chatParticipation.chatId]!!,
                        user = user
                )
                        .awaitFirst()
            }
        }
                .flatMapMany { Flux.fromIterable(it) }
    }

    private fun countUnreadMessages(chatParticipation: ChatParticipation): Mono<Long> {
        return mono {
            if (chatParticipation.lastReadMessageCreatedAt != null) {
                messageRepository.countByChatIdAndCreatedAtAfterAndSenderIdNot(
                        chatId = chatParticipation.chatId,
                        date = chatParticipation.lastReadMessageAt!!,
                        senderId = chatParticipation.user.id
                )
                        .awaitFirst()
            } else {
                0
            }
        }
    }

    override fun isChatCreatedByUser(chatId: String, userId: String): Mono<Boolean> {
        return chatRepository.findById(chatId)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $chatId")))
                .map { it.createdById == userId }
    }

    override fun checkChatSlugAvailability(slug: String): Mono<AvailabilityResponse> {
        return chatRepository.existsBySlugOrId(slug, slug)
                .map { AvailabilityResponse(available = !it) }
    }

    override fun getPopularChats(paginationRequest: PaginationRequest): Flux<ChatResponse> {
        return mono {
            val pageRequest = PageRequest.of(
                    paginationRequest.page!!,
                    paginationRequest.pageSize!!,
                    Sort.by(
                            Sort.Order.desc("numberOfOnlineParticipants"),
                            Sort.Order.desc("numberOfParticipants")
                    )
            )
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            var currentUserId: String? = null

            if (currentUser != authenticationFacade.EMPTY_USER) {
                currentUserId = currentUser.id
            }

            chatRepository
                    .findAllByDeletedFalseAndTypeIn(listOf(ChatType.GROUP), pageRequest)
                    .map { chat -> chatMapper.toChatResponse(chat = chat, currentUserId = currentUserId) }
        }
                .flatMapMany { chat -> chat }
    }

    override fun findChatEntityById(id: String): Mono<Chat> {
        return findChatByIdInternal(id, true)
    }

    override fun findChatById(id: String): Mono<ChatResponseWithCreatorId> {
        return findChatByIdInternal(id)
                .map { chat -> chatMapper.toChatResponseWithCreatorId(chat) }
    }

    override fun deleteMultipleChats(deleteMultipleChatsRequest: DeleteMultipleChatsRequest): Mono<Void> {
        return mono {
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val chatIds = deleteMultipleChatsRequest.chatDeletions.map { chatDeletion -> chatDeletion.chatId }
            var chats = chatRepository.findAllById(chatIds).collectList().awaitFirst()
            val chatDeletionsMap = transformChatDeletionsToMap(deleteMultipleChatsRequest.chatDeletions)

            chats = chats.map { chat -> chat.copy(
                    deletedById = currentUser.id,
                    deletedAt = timeService.now(),
                    chatDeletion = ChatDeletion(
                            id = UUID.randomUUID().toString(),
                            comment = chatDeletionsMap[chat.id]!!.comment,
                            deletionReason = chatDeletionsMap[chat.id]!!.reason
                    )
            ) }

            chatRepository.saveAll(chats).collectList().awaitFirst()
            chats.forEach { chat -> Mono.fromRunnable<Void> {
                chatEventsPublisher.chatDeleted(
                        ChatDeleted(
                                id = chat.id,
                                comment = chat.chatDeletion?.comment,
                                reason = chat.chatDeletion?.deletionReason
                        )
                )
            }
                    .subscribe()
            }
        }
                .flatMap { Mono.empty<Void>() }
    }

    private fun transformChatDeletionsToMap(chatDeletions: List<DeleteChatRequestWithChatId>): Map<String, DeleteChatRequestWithChatId> {
        val map = HashMap<String, DeleteChatRequestWithChatId>()

        chatDeletions.forEach { chatDeletion -> map[chatDeletion.chatId] = chatDeletion }

        return map
    }

    private fun findChatByIdInternal(id: String, retrieveFromCache: Boolean = false) = chatRepository.findById(id)
            .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $id")))
}
