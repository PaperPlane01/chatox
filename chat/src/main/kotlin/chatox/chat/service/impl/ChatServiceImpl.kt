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
import chatox.chat.config.CacheWrappersConfig
import chatox.chat.config.RedisConfig
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
import chatox.chat.model.ChatParticipantsCount
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatType
import chatox.chat.model.DialogDisplay
import chatox.chat.model.ImageUploadMetadata
import chatox.chat.model.Message
import chatox.chat.model.SlowMode
import chatox.chat.model.StandardChatRole
import chatox.chat.model.Upload
import chatox.chat.model.UploadType
import chatox.chat.model.User
import chatox.chat.repository.mongodb.ChatMessagesCounterRepository
import chatox.chat.repository.mongodb.ChatParticipationRepository
import chatox.chat.repository.mongodb.ChatRepository
import chatox.chat.repository.mongodb.MessageMongoRepository
import chatox.chat.repository.mongodb.PendingChatParticipationRepository
import chatox.chat.repository.mongodb.UploadRepository
import chatox.chat.service.ChatParticipantsCountService
import chatox.chat.service.ChatRoleService
import chatox.chat.service.ChatService
import chatox.chat.service.CreateMessageService
import chatox.platform.cache.ReactiveCacheService
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.log.LogExecution
import chatox.platform.pagination.PaginationRequest
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.bson.types.ObjectId
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import org.springframework.util.ObjectUtils
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime
import java.util.UUID

@Service
@LogExecution
class ChatServiceImpl(private val chatRepository: ChatRepository,
                      private val chatParticipationRepository: ChatParticipationRepository,
                      private val pendingChatParticipationRepository: PendingChatParticipationRepository,
                      private val messageRepository: MessageMongoRepository,
                      private val uploadRepository: UploadRepository,
                      private val chatMessagesCounterRepository: ChatMessagesCounterRepository,
                      private val messageCacheWrapper: ReactiveRepositoryCacheWrapper<Message, String>,
                      private val userCacheWrapper: ReactiveRepositoryCacheWrapper<User, String>,

                      @Qualifier(CacheWrappersConfig.CHAT_BY_ID_CACHE_WRAPPER)
                      private val chatByIdCacheWrapper: ReactiveRepositoryCacheWrapper<Chat, String>,
                      
                      @Qualifier(CacheWrappersConfig.CHAT_BY_SLUG_CACHE_WRAPPER)
                      private val chatBySlugCacheWrapper: ReactiveRepositoryCacheWrapper<Chat, String>,

                      @Qualifier(RedisConfig.CHAT_BY_SLUG_CACHE_SERVICE)
                      private val chatBySlugCacheService: ReactiveCacheService<Chat, String>,
                      private val chatMapper: ChatMapper,
                      private val chatParticipationMapper: ChatParticipationMapper,
                      private val authenticationHolder: ReactiveAuthenticationHolder<User>,
                      private val chatEventsPublisher: ChatEventsPublisher,
                      private val createMessageService: CreateMessageService,
                      private val chatRoleService: ChatRoleService,
                      private val chatParticipantsCountService: ChatParticipantsCountService) : ChatService {
    private val log = LoggerFactory.getLogger(this.javaClass)

    override fun createChat(createChatRequest: CreateChatRequest): Mono<ChatOfCurrentUserResponse> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUser().awaitFirst()
            val chatId = UUID.randomUUID().toString()
            val chat = Chat(
                    id = chatId,
                    slug = createChatRequest.slug ?: chatId,
                    name = createChatRequest.name,
                    description = createChatRequest.description,
                    tags = createChatRequest.tags,
                    createdAt = ZonedDateTime.now(),
                    createdById = currentUser.id,
                    type = ChatType.GROUP
            )
            val chatMessagesCounter = ChatMessagesCounter(
                    id = UUID.randomUUID().toString(),
                    chatId = chat.id,
                    messagesCount = 0L
            )
            chatMessagesCounterRepository.save(chatMessagesCounter).awaitFirst()
            chatRepository.save(chat).awaitFirst()

            val chatRoles = chatRoleService.createRolesForChat(chat).collectList().awaitFirst()
            val ownerRole = chatRoles.find { role -> role.name == StandardChatRole.OWNER.name }!!

            val creatorDisplayedName = currentUser.displayedName
            val creatorChatParticipation = ChatParticipation(
                    id = ObjectId().toHexString(),
                    user = currentUser,
                    chatId = chat.id,
                    chatType = ChatType.GROUP,
                    role = ownerRole,
                    roleId = ownerRole.id,
                    createdAt = ZonedDateTime.now(),
                    userDisplayedName = creatorDisplayedName,
                    userSlug = currentUser.slug,
                    userOnline = currentUser.online ?: false
            )
            chatParticipationRepository.save(creatorChatParticipation).awaitFirst()
            val participantsCount = chatParticipantsCountService.initializeForChat(
                    chatId = chat.id,
                    participantsCount = 1,
                    onlineParticipantsCount = if (currentUser.online == true) 1 else 0
            )
                    .awaitFirst()
            chatEventsPublisher.userJoinedChat(
                    chatParticipationMapper.toChatParticipationResponse(
                            chatParticipation = creatorChatParticipation,
                            chatRole = ownerRole
                    ).awaitFirst()
            )

            return@mono chatMapper.toChatOfCurrentUserResponse(
                    chat = chat,
                    chatParticipation = creatorChatParticipation,
                    unreadMessagesCount = 0,
                    lastMessage = null as Message?,
                    lastReadMessage = null as Message?,
                    chatParticipantsCount = participantsCount
            )
                    .awaitFirst()
        }
    }

    override fun createPrivateChat(createPrivateChatRequest: CreatePrivateChatRequest): Mono<ChatOfCurrentUserResponse> {
        return mono {
            val user = userCacheWrapper.findById(createPrivateChatRequest.userId).awaitFirstOrNull()
                    ?: throw UserNotFoundException("Could not find user with id ${createPrivateChatRequest.userId}")
            val currentUser = authenticationHolder.requireCurrentUser().awaitFirst()

            val chatId = UUID.randomUUID().toString()
            val chat = Chat(
                    id = chatId,
                    createdById = currentUser.id,
                    createdAt = ZonedDateTime.now(),
                    type = ChatType.DIALOG,
                    name = "dialog-${currentUser.id}-${user.id}",
                    deleted = false,
                    slug = chatId
            )

            val chatMessagesCounter = ChatMessagesCounter(
                    id = UUID.randomUUID().toString(),
                    chatId = chatId,
                    messagesCount = 1L
            )
            chatMessagesCounterRepository.save(chatMessagesCounter).awaitFirst()
            val userRole = chatRoleService.createUserRoleForChat(chat).awaitFirst()

            var currentUserChatParticipation = ChatParticipation(
                    id = ObjectId().toHexString(),
                    chatId = chatId,
                    chatType = ChatType.DIALOG,
                    deleted = false,
                    createdAt = ZonedDateTime.now(),
                    user = currentUser,
                    role = userRole,
                    roleId = userRole.id,
                    chatDeleted = false,
                    userOnline = currentUser.online ?: false,
                    userDisplayedName = currentUser.displayedName,
                    userSlug = currentUser.slug,
            )
            val otherUserChatParticipation = ChatParticipation(
                    id = ObjectId().toHexString(),
                    chatId = chatId,
                    chatType = ChatType.DIALOG,
                    deleted = false,
                    createdAt = ZonedDateTime.now(),
                    user = user,
                    role = userRole,
                    roleId = userRole.id,
                    chatDeleted = false,
                    userOnline = user.online ?: false,
                    userDisplayedName = user.displayedName,
                    userSlug = user.slug
            )

            val message = createMessageService.createFirstMessageForPrivateChat(
                    chatId = chatId,
                    createMessageRequest = createPrivateChatRequest.message,
                    chatParticipation = currentUserChatParticipation
            )
                    .awaitFirst()
            currentUserChatParticipation = currentUserChatParticipation.copy(
                    lastReadMessageAt = message.createdAt,
                    lastReadMessageCreatedAt = message.createdAt,
                    lastReadMessageId = message.id
            )

            val chatParticipations = mutableListOf(currentUserChatParticipation, otherUserChatParticipation)
            chatParticipationRepository.saveAll(chatParticipations).collectList().awaitFirst()

            val dialogParticipantsDisplay = listOf(
                    DialogDisplay(currentUser.id, chatParticipationMapper.toDialogParticipant(otherUserChatParticipation)),
                    DialogDisplay(user.id, chatParticipationMapper.toDialogParticipant(currentUserChatParticipation))
            )

            chatRepository.save(chat.copy(
                    lastMessageId = message.id,
                    lastMessageDate = message.createdAt,
                    dialogDisplay = dialogParticipantsDisplay
            )).awaitFirst()

            val privateChatCreated = PrivateChatCreated(
                    id = chat.id,
                    chatParticipations = chatParticipations.map { chatParticipation -> chatParticipationMapper.toChatParticipationResponse(chatParticipation).awaitFirst() },
                    message = message
            )
            chatEventsPublisher.privateChatCreated(privateChatCreated)

            return@mono chatMapper.toChatOfCurrentUserResponse(
                    chat = chat,
                    chatParticipation = currentUserChatParticipation,
                    lastMessage = message,
                    lastReadMessage = message,
                    unreadMessagesCount =  0,
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

            val slug = getSlug(updateChatRequest, chat).awaitFirst()
            val avatar = getAvatar(updateChatRequest, chat).awaitFirstOrNull()
            val slowMode = getSlowModeSettings(updateChatRequest)
            val hideFromSearch = updateChatRequest.hideFromSearch ?: false
            val hideFromSearchChanged = hideFromSearch != chat.hideFromSearch

            chat = chat.copy(
                    name = updateChatRequest.name,
                    avatar = avatar,
                    slug = slug,
                    tags = updateChatRequest.tags ?: arrayListOf(),
                    description = updateChatRequest.description,
                    slowMode = slowMode,
                    joinAllowanceSettings = updateChatRequest.joinAllowanceSettings ?: mapOf(),
                    hideFromSearch = hideFromSearch
            )

            if (hideFromSearchChanged) {
                chatParticipantsCountService.setHideFromSearch(chat.id, hideFromSearch).awaitFirst()
            }

            if (slug != null && slug != chat.slug && slug != chat.id) {
                chatBySlugCacheService.delete(chat.slug).awaitFirstOrNull()
            }

            return@mono updateChat(chat).awaitFirst()
        }
    }

    private fun getSlug(updateChatRequest: UpdateChatRequest, chat: Chat): Mono<String> {
        return mono {
            return@mono when (updateChatRequest.slug) {
                null -> chat.id
                chat.slug -> chat.slug
                else -> {
                    val slugAvailability = checkChatSlugAvailability(updateChatRequest.slug).awaitFirst()

                    if (!slugAvailability.available) {
                        throw SlugIsAlreadyInUseException(
                                "Slug ${updateChatRequest.slug} is already used by another chat"
                        )
                    }

                    updateChatRequest.slug
                }
            }
        }
    }

    private fun getAvatar(updateChatRequest: UpdateChatRequest, chat: Chat): Mono<Upload<ImageUploadMetadata>?> {
        return mono {
            return@mono when (updateChatRequest.avatarId) {
                null -> null
                chat.avatar?.id -> chat.avatar
                else -> {
                    uploadRepository.findByIdAndType<ImageUploadMetadata>(
                            updateChatRequest.avatarId,
                            UploadType.IMAGE
                    )
                            .awaitFirstOrNull<Upload<ImageUploadMetadata>?>()
                            ?: throw UploadNotFoundException("Could not find image with id ${updateChatRequest.avatarId}")
                }
            }
        }
    }

    private fun getSlowModeSettings(updateChatRequest: UpdateChatRequest): SlowMode? {
        return if (updateChatRequest.slowMode == null) {
            null
        } else {
            SlowMode(
                    enabled = updateChatRequest.slowMode.enabled,
                    interval = updateChatRequest.slowMode.interval,
                    unit = updateChatRequest.slowMode.unit
            )
        }
    }

    override fun updateChat(chat: Chat): Mono<ChatResponse> {
        return mono {
            chatRepository.save(chat).awaitFirst()
            val chatUpdatedEvent = chatMapper.toChatUpdated(chat)
            chatEventsPublisher.chatUpdated(chatUpdatedEvent)
            val chatParticipantsCount = chatParticipantsCountService
                    .getChatParticipantsCount(chat.id)
                    .awaitFirstOrNull()

            return@mono chatMapper.toChatResponse(
                    chat = chat,
                    chatParticipantsCount = chatParticipantsCount
            )
        }
    }

    override fun deleteChat(id: String, deleteChatRequest: DeleteChatRequest?): Mono<Unit> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            var chat = chatByIdCacheWrapper.findById(id).awaitFirst()

            var chatDeletion: ChatDeletion? = null

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

                chatDeletion = ChatDeletion(
                        id = ObjectId().toHexString(),
                        deletionReason = deleteChatRequest.reason,
                        comment = deleteChatRequest.comment
                )
            }

            chat = chat.copy(
                    deleted = true,
                    deletedAt = ZonedDateTime.now(),
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

            return@mono
        }
    }

    override fun findChatBySlugOrId(slugOrId: String): Mono<ChatResponse> {
        return mono {
            val chat = chatBySlugCacheWrapper.findById(slugOrId).awaitFirstOrNull()
                    ?: throw ChatNotFoundException("Could not find chat with id or slug $slugOrId")

            if (chat.deleted) {
                throw ChatDeletedException(chat.chatDeletion)
            }

            val currentUser = authenticationHolder.currentUser.awaitFirstOrNull()
            var otherUser: User? = null

            if (chat.type == ChatType.DIALOG) {
                if (currentUser == null) {
                    throw AccessDeniedException("")
                }

                val chatParticipants = chatParticipationRepository.findByChatId(chat.id).collectList().awaitFirst()
                chatParticipants.first { chatParticipation -> chatParticipation.user.id == currentUser.id }

                val otherUserChatParticipation = chatParticipants
                        .firstOrNull { chatParticipation -> chatParticipation.user.id != currentUser.id }

                otherUser = if (otherUserChatParticipation != null) {
                    userCacheWrapper.findById(otherUserChatParticipation.user.id).awaitFirst()
                } else {
                    currentUser
                }
            }

            val chatParticipantsCount = if (chat.type == ChatType.DIALOG) {
                null
            } else {
                chatParticipantsCountService.getChatParticipantsCount(chat.id)
                        .awaitFirstOrNull()
            }

            return@mono chatMapper.toChatResponse(
                    chat = chat,
                    currentUserId = currentUser?.id,
                    user = otherUser,
                    chatParticipantsCount = chatParticipantsCount
            )
        }
    }

    override fun searchChats(query: String, paginationRequest: PaginationRequest): Flux<ChatResponse> {
        return mono {
            val chats = chatRepository.searchChats(query, listOf(ChatType.GROUP), paginationRequest.toPageRequest())
                    .collectList()
                    .awaitFirst()
            val chatIds = chats.map { chat -> chat.id }
            val chatParticipantsCount = chatParticipantsCountService.getChatParticipantsCount(chatIds)
                    .awaitFirst()

            return@mono chats.map { chat -> chatMapper.toChatResponse(
                    chat = chat,
                    chatParticipantsCount = chatParticipantsCount[chat.id] ?: ChatParticipantsCount.EMPTY
            ) }
        }
                .flatMapMany { Flux.fromIterable(it) }
    }

    override fun getChatsOfCurrentUser(): Flux<ChatOfCurrentUserResponse> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUser().awaitFirst()
            val chatParticipations = chatParticipationRepository
                    .findAllByUserIdAndDeletedFalse(currentUser.id)
                    .collectList()
                    .awaitFirst()
            val unreadMessagesMap: MutableMap<String, Long> = HashMap()

            chatParticipations.forEach { chatParticipation ->
                unreadMessagesMap[chatParticipation.chatId] = countUnreadMessages(chatParticipation)
                        .awaitFirst()
            }

            val allChatIds = mutableListOf<String>()
            val groupChatIds = mutableListOf<String>()

            chatParticipations.forEach { chatParticipation ->
                allChatIds.add(chatParticipation.chatId)

                if (chatParticipation.chatType == ChatType.GROUP) {
                    groupChatIds.add(chatParticipation.chatId)
                }
            }

            val chats = chatByIdCacheWrapper
                    .findByIds(allChatIds)
                    .collectList()
                    .awaitFirst()
                    .associateBy { chat -> chat.id }
            val chatParticipantsCount = chatParticipantsCountService.getChatParticipantsCount(groupChatIds)
                    .awaitFirst()

            chatParticipations
                    .filter { chatParticipation -> chats.containsKey(chatParticipation.chatId) }
                    .map { chatParticipation ->
                        val chat = chats[chatParticipation.chatId]!!
                        val lastReadMessage = if (chatParticipation.lastReadMessageId != null) {
                            messageCacheWrapper.findById(chatParticipation.lastReadMessageId).awaitFirst()
                        } else null

                        val lastMessage = if (chat.lastMessageId != null) {
                            messageCacheWrapper.findById(chat.lastMessageId).awaitFirst()
                        } else null

                        val user = if (chat.type == ChatType.DIALOG) {
                            val chatParticipants = chatParticipationRepository
                                    .findByChatIdAndDeletedFalse(chat.id)
                                    .collectList()
                                    .awaitFirst()
                            val otherUserChatParticipation = chatParticipants
                                    .find { chatParticipant -> chatParticipant.user.id != currentUser.id }

                            if (otherUserChatParticipation != null) {
                                userCacheWrapper.findById(otherUserChatParticipation.user.id).awaitFirst()
                            } else {
                                currentUser
                            }
                        } else null

                        return@map chatMapper.toChatOfCurrentUserResponse(
                                chat = chat,
                                chatParticipation = chatParticipation,
                                lastReadMessage = lastReadMessage,
                                lastMessage = lastMessage,
                                unreadMessagesCount = unreadMessagesMap[chatParticipation.chatId] ?: 0,
                                user = user,
                                chatParticipantsCount = chatParticipantsCount[chat.id] ?: ChatParticipantsCount.EMPTY
                        )
                                .awaitFirst()
            }
        }
                .flatMapMany { Flux.fromIterable(it) }
    }

    override fun getPendingChatsOfCurrentUser(): Flux<ChatResponse> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUser().awaitFirst()
            val pendingChatParticipations = pendingChatParticipationRepository.findByUserIdOrderByCreatedAtAsc(
                    userId = currentUser.id
            )
                    .collectList()
                    .awaitFirst()

            val chatIdsAndDates = pendingChatParticipations.associate { pendingChatParticipation -> Pair(
                    pendingChatParticipation.chatId,
                    pendingChatParticipation.createdAt
            ) }
            val chatIds = chatIdsAndDates.keys.toList()
            val chats = chatRepository.findByIdInAndTypeInAndDeletedFalse(
                    ids = chatIds,
                    types = listOf(ChatType.GROUP)
            )
                    .collectList()
                    .awaitFirst()
            val chatParticipantsCount = chatParticipantsCountService
                    .getChatParticipantsCount(chatIds)
                    .awaitFirst()

            return@mono chats
                    .map { chat -> chatMapper.toChatResponse(
                            chat = chat,
                            currentUserId = currentUser.id,
                            chatParticipantsCount = chatParticipantsCount[chat.id] ?: ChatParticipantsCount.EMPTY
                    ) }
                    .sortedByDescending { chat -> chatIdsAndDates[chat.id] }
        }
                .flatMapMany { Flux.fromIterable(it) }
    }

    private fun countUnreadMessages(chatParticipation: ChatParticipation): Mono<Long> {
        return mono {
            if (chatParticipation.lastReadMessageCreatedAt != null) {
                return@mono messageRepository.countByChatIdAndCreatedAtAfterAndSenderIdNot(
                        chatId = chatParticipation.chatId,
                        date = chatParticipation.lastReadMessageAt!!,
                        senderId = chatParticipation.user.id
                )
                        .awaitFirst()
            } else {
                return@mono 0
            }
        }
    }

    override fun isChatCreatedByUser(chatId: String, userId: String): Mono<Boolean> {
        return chatByIdCacheWrapper.findById(chatId)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $chatId")))
                .map { it.createdById == userId }
    }

    override fun checkChatSlugAvailability(slug: String): Mono<AvailabilityResponse> {
        return chatRepository.existsBySlugOrId(slug, slug)
                .map { AvailabilityResponse(available = !it) }
    }

    override fun getPopularChats(paginationRequest: PaginationRequest): Flux<ChatResponse> {
        return mono {
            val participantsCount = chatParticipantsCountService
                    .getPopularChatsParticipantsCount(paginationRequest)
                    .awaitFirst()
            val chatIds = participantsCount.keys.toList()
            val chats = chatByIdCacheWrapper.findByIds(chatIds).collectList().awaitFirst()

            val currentUser = authenticationHolder.currentUser.awaitFirstOrNull()
            var currentUserId: String? = null

            if (currentUser != null) {
                currentUserId = currentUser.id
            }

            return@mono chats.map { chat -> chatMapper.toChatResponse(
                    chat = chat,
                    currentUserId = currentUserId,
                    chatParticipantsCount = participantsCount[chat.id] ?: ChatParticipantsCount.EMPTY
            ) }
        }
                .flatMapMany { Flux.fromIterable(it) }
    }

    override fun findChatEntityById(id: String): Mono<Chat> {
        return findChatByIdInternal(id)
    }

    override fun findChatById(id: String): Mono<ChatResponseWithCreatorId> {
        return findChatByIdInternal(id)
                .map { chat -> chatMapper.toChatResponseWithCreatorId(chat) }
    }

    override fun deleteMultipleChats(deleteMultipleChatsRequest: DeleteMultipleChatsRequest): Mono<Unit> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val chatIds = deleteMultipleChatsRequest.chatDeletions.map { chatDeletion -> chatDeletion.chatId }
            var chats = chatRepository.findAllById(chatIds).collectList().awaitFirst()
            val chatDeletionsMap = transformChatDeletionsToMap(deleteMultipleChatsRequest.chatDeletions)

            chats = chats.map { chat -> chat.copy(
                    deletedById = currentUser.id,
                    deletedAt =  ZonedDateTime.now(),
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

            return@mono
        }
    }

    private fun transformChatDeletionsToMap(chatDeletions: List<DeleteChatRequestWithChatId>): Map<String, DeleteChatRequestWithChatId> {
        val map = HashMap<String, DeleteChatRequestWithChatId>()

        chatDeletions.forEach { chatDeletion -> map[chatDeletion.chatId] = chatDeletion }

        return map
    }

    private fun findChatByIdInternal(id: String) = chatByIdCacheWrapper.findById(id)
            .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $id")))
}
