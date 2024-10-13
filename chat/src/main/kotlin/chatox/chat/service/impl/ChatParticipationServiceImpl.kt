package chatox.chat.service.impl

import chatox.chat.api.request.PendingChatParticipantsRequest
import chatox.chat.api.request.UpdateChatParticipationRequest
import chatox.chat.api.response.ChatParticipationMinifiedResponse
import chatox.chat.api.response.ChatParticipationResponse
import chatox.chat.api.response.PendingChatParticipationResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.cache.DefaultRoleOfChatCacheWrapper
import chatox.chat.exception.ChatInviteNotFoundException
import chatox.chat.exception.ChatParticipationNotFoundException
import chatox.chat.exception.ChatRoleNotFoundException
import chatox.chat.exception.PendingChatParticipationNotFoundException
import chatox.chat.exception.metadata.ChatDeletedException
import chatox.chat.exception.metadata.ChatNotFoundException
import chatox.chat.exception.metadata.JoinChatRejectedException
import chatox.chat.mapper.ChatParticipationMapper
import chatox.chat.mapper.UserMapper
import chatox.chat.messaging.rabbitmq.event.ChatParticipationDeleted
import chatox.chat.messaging.rabbitmq.event.UserLeftChat
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.Chat
import chatox.chat.model.ChatInvite
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatRole
import chatox.chat.model.ChatType
import chatox.chat.model.JoinChatAllowance
import chatox.chat.model.JoinChatRejectionReason
import chatox.chat.model.PendingChatParticipation
import chatox.chat.model.TextInfo
import chatox.chat.model.User
import chatox.chat.repository.mongodb.ChatInviteRepository
import chatox.chat.repository.mongodb.ChatParticipationRepository
import chatox.chat.repository.mongodb.ChatRepository
import chatox.chat.repository.mongodb.ChatRoleRepository
import chatox.chat.repository.mongodb.PendingChatParticipationRepository
import chatox.chat.service.ChatInviteService
import chatox.chat.service.ChatParticipantsCountService
import chatox.chat.service.ChatParticipationService
import chatox.chat.service.MessageReadService
import chatox.chat.util.mapTo2Lists
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.log.LogExecution
import chatox.platform.pagination.PaginationRequest
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.bson.types.ObjectId
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Service
@LogExecution
class ChatParticipationServiceImpl(private val chatParticipationRepository: ChatParticipationRepository,
                                   private val chatRoleRepository: ChatRoleRepository,
                                   private val chatRepository: ChatRepository,
                                   private val chatInviteRepository: ChatInviteRepository,
                                   private val pendingChatParticipationRepository: PendingChatParticipationRepository,
                                   private val userCacheWrapper: ReactiveRepositoryCacheWrapper<User, String>,
                                   private val defaultRoleOfChatCacheWrapper: DefaultRoleOfChatCacheWrapper,
                                   private val chatInviteService: ChatInviteService,
                                   private val chatParticipantsCountService: ChatParticipantsCountService,
                                   private val messageReadService: MessageReadService,
                                   private val chatEventsPublisher: ChatEventsPublisher,
                                   private val userMapper: UserMapper,
                                   private val authenticationHolder: ReactiveAuthenticationHolder<User>
): ChatParticipationService {
    private val log = LoggerFactory.getLogger(this::class.java)

    private lateinit var chatParticipationMapper: ChatParticipationMapper

    @Autowired
    fun setChatParticipationMapper(chatParticipationMapper: ChatParticipationMapper) {
        this.chatParticipationMapper = chatParticipationMapper
    }

    override fun joinChat(chatId: String, inviteId: String?): Mono<ChatParticipationMinifiedResponse> {
        return mono {
            val chat = chatRepository.findById(chatId).awaitFirst()

            if (chat.deleted) {
                throw ChatDeletedException(chat.chatDeletion)
            }

            val currentUser = authenticationHolder.requireCurrentUser().awaitFirst()

            if (!checkPendingChatParticipation(chatId, currentUser.id).awaitFirst()) {
                throw JoinChatRejectedException(JoinChatRejectionReason.AWAITING_APPROVAL)
            }

            var invite: ChatInvite? = null

            if (inviteId != null) {
                invite = findAndCheckInvite(chatId, inviteId).awaitFirst()
            }

            val chatParticipation = chatParticipationRepository.findByChatIdAndUserIdAndDeletedTrue(
                    chatId = chat.id,
                    userId = currentUser.id
            )
                    .awaitFirstOrNull()

            val allowance = if (invite != null) {
                JoinChatAllowance.getAllowance(currentUser.verificationLevel, invite.joinAllowanceSettings)
            } else {
                JoinChatAllowance.getAllowance(currentUser.verificationLevel, chat.joinAllowanceSettings)
            }

            when (allowance) {
                JoinChatAllowance.ALLOWED -> return@mono createChatParticipation(
                        chat = chat,
                        user = currentUser,
                        invite = invite,
                        restoredChatParticipation = chatParticipation
                )
                        .awaitFirst()
                JoinChatAllowance.INVITE_ONLY -> if (invite == null) {
                    throw JoinChatRejectedException(JoinChatRejectionReason.INSUFFICIENT_VERIFICATION_LEVEL)
                } else {
                    return@mono createChatParticipation(
                            chat = chat,
                            user = currentUser,
                            invite = invite,
                            restoredChatParticipation = chatParticipation
                    )
                            .awaitFirst()
                }
                JoinChatAllowance.REQUIRES_APPROVAL -> return@mono createPendingChatParticipation(
                        chat = chat,
                        user = currentUser,
                        invite = invite,
                        restoredChatParticipation = chatParticipation
                )
                        .awaitFirst()
                JoinChatAllowance.NOT_ALLOWED ->
                    throw JoinChatRejectedException(JoinChatRejectionReason.INSUFFICIENT_VERIFICATION_LEVEL)
            }
        }
    }

    private fun findAndCheckInvite(chatId: String, inviteId: String): Mono<ChatInvite> {
        return mono {
            val chatInvite = chatInviteRepository.findByIdAndChatId(
                    id = inviteId,
                    chatId = chatId,
                    activeOnly = true
            )
                    .awaitFirstOrNull() ?: throw ChatInviteNotFoundException(inviteId)
            val chatInviteUsage = chatInviteService.getChatInviteUsageInfo(chatInvite).awaitFirst()

            if (!chatInviteUsage.canBeUsed) {
                throw JoinChatRejectedException(chatInviteUsage.rejectionReason!!)
            }

            return@mono chatInvite
        }
    }

    private fun checkPendingChatParticipation(chatId: String, userId: String): Mono<Boolean> {
        return this.pendingChatParticipationRepository.existsByChatIdAndUserId(
                chatId = chatId,
                userId = userId
        )
                .map { !it }
    }

    private fun createChatParticipation(
            chat: Chat,
            user: User,
            invite: ChatInvite?,
            restoredChatParticipation: ChatParticipation?
    ): Mono<ChatParticipationMinifiedResponse> {
        return mono {
            val chatRole = chatRoleRepository.findByChatIdAndDefaultTrue(chat.id).awaitFirst()
            val userDisplayedName = user.displayedName

            val chatParticipation = restoredChatParticipation?.copy(
                    deleted = false,
                    deletedAt = null,
                    deletedById = null
            )
                    ?: ChatParticipation(
                            id = ObjectId().toHexString(),
                            user = user,
                            chatId = chat.id,
                            chatType = chat.type,
                            createdAt = ZonedDateTime.now(),
                            role = chatRole,
                            roleId = chatRole.id,
                            lastReadMessageId = null,
                            userDisplayedName = userDisplayedName,
                            userSlug = user.slug,
                            inviteId = invite?.id
                    )
            chatParticipationRepository.save(chatParticipation).awaitFirst()

            if (restoredChatParticipation == null) {
                messageReadService.initializeUnreadMessagesCount(chatParticipation, chat.lastMessageId).awaitFirst()
            }

            if (invite != null) {
                chatInviteRepository.updateChatInviteUsage(
                        chatInvite = invite,
                        lastUsedAt = chatParticipation.createdAt,
                        lastUsedBy = user.id
                )
                        .awaitFirst()
            }

            chatParticipantsCountService.increaseChatParticipantsCount(chat.id).awaitFirst()
            publishUserJoinedChat(chatParticipation, user, chatRole)

            return@mono chatParticipationMapper.toMinifiedChatParticipationResponse(chatParticipation).awaitFirst()
        }
    }

    private fun createPendingChatParticipation(
            chat: Chat,
            user: User,
            invite: ChatInvite?,
            restoredChatParticipation: ChatParticipation? = null
    ): Mono<ChatParticipationMinifiedResponse> {
        return mono {
            val pendingChatParticipation = PendingChatParticipation(
                    id = ObjectId().toHexString(),
                    createdAt = ZonedDateTime.now(),
                    userId = user.id,
                    inviteId = invite?.id,
                    restoredChatParticipationId = restoredChatParticipation?.id,
                    chatId = chat.id
            )
            pendingChatParticipationRepository.save(pendingChatParticipation).awaitFirst()

            return@mono chatParticipationMapper.toMinifiedChatParticipationResponse(pendingChatParticipation)
        }
    }

    override fun leaveChat(chatId: String): Mono<Unit> {
        return mono {
            val chat = chatRepository.findById(chatId).awaitFirst()
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()

            var chatParticipation = chatParticipationRepository
                    .findByChatIdAndUserIdAndDeletedFalse(
                            chatId = chat.id,
                            userId = currentUser.id
                    )
                    .awaitFirst()
            chatParticipation = chatParticipation.copy(
                    deleted = true,
                    deletedAt = ZonedDateTime.now(),
                    deletedById = currentUser.id
            )
            chatParticipation = chatParticipationRepository.save(chatParticipation).awaitFirst()

            if (chatParticipation.userOnline) {
                chatParticipantsCountService.decreaseOnlineParticipantsCount(chatId).awaitFirst()
            }

            chatParticipantsCountService.decreaseChatParticipantsCount(chatId).awaitFirst()

            chatEventsPublisher.userLeftChat(
                    UserLeftChat(
                            userId = chatParticipation.user.id,
                            chatId = chatParticipation.chatId,
                            chatParticipationId = chatParticipation.id
                    )
            )

            return@mono
        }
    }

    override fun updateChatParticipation(
            id: String,
            chatId: String,
            updateChatParticipationRequest: UpdateChatParticipationRequest
    ): Mono<ChatParticipationResponse> {
        return mono {
            var chatParticipation = findChatParticipationByIdAndChatId(id, chatId).awaitFirst()
            val chatRole = chatRoleRepository.findById(updateChatParticipationRequest.roleId).awaitFirst()
            chatParticipation = chatParticipation.copy(roleId = chatRole.id, role = chatRole)
            chatParticipationRepository.save(chatParticipation).awaitFirst()

            val chatParticipationResponse = chatParticipationMapper.toChatParticipationResponse(chatParticipation).awaitFirst()
            chatEventsPublisher.chatParticipationUpdated(chatParticipationResponse)

            return@mono chatParticipationResponse
        }
    }

    private fun findChatParticipationByIdAndChatId(id: String, chatId: String): Mono<ChatParticipation> {
        return chatParticipationRepository.findByIdAndChatId(id = id, chatId = chatId)
                .switchIfEmpty(Mono.error(ChatParticipationNotFoundException("Could not find chat participation with id $id and chatId $chatId")))
    }

    override fun deleteChatParticipation(id: String, chatId: String): Mono<Unit> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUser().awaitFirst()

            var chatParticipation = chatParticipationRepository.findByIdAndDeletedFalse(id).awaitFirst()

            log.info("Marking chat participation as deleted")
            chatParticipation = chatParticipation.copy(
                    deleted = true,
                    deletedAt = ZonedDateTime.now(),
                    deletedById = currentUser.id
            )

            log.info("Saving chat participation to database")
            chatParticipationRepository.save(chatParticipation).awaitFirst()

            if (chatParticipation.userOnline) {
                chatParticipantsCountService.decreaseOnlineParticipantsCount(chatParticipation.chatId).awaitFirst()
            }

            chatParticipantsCountService.decreaseChatParticipantsCount(chatParticipation.chatId).awaitFirst()

            log.info("Publishing chatParticipationDeleted event")
            chatEventsPublisher.chatParticipationDeleted(
                    ChatParticipationDeleted(
                            userId = chatParticipation.user.id,
                            chatId = chatParticipation.chatId,
                            chatParticipationId = chatParticipation.id
                    )
            )

            return@mono
        }
    }

    override fun findParticipantsOfChat(chatId: String, paginationRequest: PaginationRequest): Flux<ChatParticipationResponse> {
        return mono {
            val chat = findChatById(chatId).awaitFirst()
            return@mono mapChatParticipations(chatParticipationRepository.findByChatIdAndDeletedFalse(chat.id))
        }
                .flatMapMany { it }
    }

    override fun searchChatParticipants(chatId: String, query: String, paginationRequest: PaginationRequest): Flux<ChatParticipationResponse> {
        return mono {
            val chat = findChatById(chatId).awaitFirst()

            return@mono mapChatParticipations(chatParticipationRepository.searchChatParticipants(
                    chatId = chat.id,
                    searchQuery = query,
                    pageable = paginationRequest.toPageRequest()
            ))
        }
                .flatMapMany { it }
    }

    override fun findChatParticipationById(participationId: String): Mono<ChatParticipationResponse> {
        return chatParticipationRepository.findByIdAndDeletedFalse(participationId)
                .switchIfEmpty(Mono.error(ChatParticipationNotFoundException("Could not find chat participation with id $participationId")))
                .flatMap { chatParticipationMapper.toChatParticipationResponse(it) }
    }

    override fun getMinifiedChatParticipation(chatId: String, user: User): Mono<ChatParticipationMinifiedResponse> {
        return chatRepository.findById(chatId)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $chatId")))
                .flatMap { chatParticipationRepository.findByChatIdAndUserIdAndDeletedFalse(it.id, user.id) }
                .flatMap { chatParticipationMapper.toMinifiedChatParticipationResponse(it, true) }
    }

    override fun findOnlineParticipants(chatId: String): Flux<ChatParticipationResponse> {
        return mono {
            val chat = findChatById(chatId).awaitFirst()

            return@mono mapChatParticipations(
                    chatParticipationRepository.findByChatIdAndUserOnlineTrue(chat.id)
            )
        }
                .flatMapMany { it }
    }

    override fun findParticipantsWithRole(chatId: String, roleId: String, paginationRequest: PaginationRequest): Flux<ChatParticipationResponse> {
        return mono {
            val chat = findChatById(chatId).awaitFirst()
            val chatRole = findChatRole(id = roleId, chatId = chatId).awaitFirst()

            return@mono mapChatParticipations(
                    chatParticipationRepository.findByChatIdAndRoleIdAndDeletedFalse(
                            chatId = chat.id,
                            roleId = chatRole.id,
                            pageable = paginationRequest.toPageRequest()
                    )
            )
        }
                .flatMapMany { it }
    }

    override fun findPendingChatParticipations(chatId: String, paginationRequest: PaginationRequest): Flux<PendingChatParticipationResponse> {
        return mono {
            val pendingChatParticipations = pendingChatParticipationRepository.findByChatIdOrderByCreatedAtAsc(
                    chatId,
                    paginationRequest.toPageRequest()
            )
                    .collectList()
                    .awaitFirst()

            return@mono mapPendingChatParticipations(pendingChatParticipations)
        }
                .flatMapMany{ it }
    }

    override fun approveChatParticipants(chatId: String, pendingChatParticipantsRequest: PendingChatParticipantsRequest): Flux<ChatParticipationResponse> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val pendingChatParticipants = pendingChatParticipationRepository.findByChatIdAndIdIn(
                    chatId = chatId,
                    ids = pendingChatParticipantsRequest.pendingChatParticipantsIds
            )
                    .collectList()
                    .awaitFirst()

            if (pendingChatParticipantsRequest.pendingChatParticipantsIds.size != pendingChatParticipants.size) {
                throw PendingChatParticipationNotFoundException(
                        "Could not find some of the specified pending chat participations"
                )
            }

            val (usersIds, restoredChatParticipationsIdsWithNulls) = mapTo2Lists(
                    pendingChatParticipants,
                    { it.userId },
                    { it.restoredChatParticipationId }
            )
            val restoredChatParticipationsIds = restoredChatParticipationsIdsWithNulls
                    .filterNotNull()

            val users = userCacheWrapper
                    .findByIds(usersIds)
                    .collectList()
                    .awaitFirst()
                    .associateBy { user -> user.id }
            val restoredChatParticipations = if (restoredChatParticipationsIds.isEmpty()) {
                listOf()
            } else {
                chatParticipationRepository.findAllById(restoredChatParticipationsIds)
                        .collectList()
                        .awaitFirst()
                        .map { chatParticipation -> chatParticipation.copy(
                                deleted = false,
                                deletedAt = null,
                                deletedById = null
                        ) }
            }

            val defaultRole = defaultRoleOfChatCacheWrapper.findByChatId(chatId).awaitFirst()
            val chatParticipations = pendingChatParticipants
                    .filter { pendingChatParticipation -> pendingChatParticipation.restoredChatParticipationId == null }
                    .map { pendingChatParticipation ->
                        val user = users[pendingChatParticipation.userId]!!

                        return@map ChatParticipation(
                                id = ObjectId().toHexString(),
                                user = user,
                                chatId = pendingChatParticipation.chatId,
                                chatType = ChatType.GROUP,
                                createdAt = ZonedDateTime.now(),
                                role = defaultRole,
                                roleId = defaultRole.id,
                                lastReadMessageId = null,
                                userDisplayedName = user.displayedName,
                                userSlug = user.slug,
                                inviteId = pendingChatParticipation.inviteId,
                                approvedBy = currentUser.id
                        )
                    }
                    .toMutableList()
            chatParticipations.addAll(restoredChatParticipations)

            chatParticipationRepository.saveAll(chatParticipations).collectList().awaitFirst()
            chatParticipantsCountService.increaseChatParticipantsCount(chatId, chatParticipations.size).awaitFirst()
            val onlineIncrease = users.values.filter { user -> user.online ?: false }.size
            chatParticipantsCountService.increaseOnlineParticipantsCount(chatId, onlineIncrease).awaitFirst()
            chatInviteService.updateChatInviteFromApprovedChatParticipations(chatParticipations).awaitFirstOrNull()

            pendingChatParticipationRepository.deleteAll(pendingChatParticipants).awaitFirstOrNull()

            val usersCache = users
                    .map { (id, user) -> Pair(id, userMapper.toUserResponse(user)) }
                    .toMap()
                    .toMutableMap()

            val response = mapChatParticipations(
                    chatParticipations = Flux.fromIterable(chatParticipations),
                    usersCache = usersCache,
                    chatRole = defaultRole
            )
                    .collectList()
                    .awaitFirst()

            response.forEach { chatParticipationResponse -> publishUserJoinedChat(chatParticipationResponse) }

            return@mono response
        }
                .flatMapMany { Flux.fromIterable(it) }
    }

    private fun publishUserJoinedChat(chatParticipation: ChatParticipation, user: User, role: ChatRole? = null) {
        mono {
            val userResponse = userMapper.toUserResponse(user)
            val usersCache = mutableMapOf(
                    Pair(user.id, userResponse)
            )
            return@mono chatParticipationMapper.toChatParticipationResponse(
                    chatParticipation = chatParticipation,
                    localUsersCache = usersCache,
                    chatRole = role
            )
                    .awaitFirst()
        }
                .map { chatParticipationResponse -> publishUserJoinedChat(chatParticipationResponse) }
                .subscribe()
    }

    private fun publishUserJoinedChat(chatParticipation: ChatParticipationResponse) = Mono.fromRunnable<Unit> {
        chatEventsPublisher.userJoinedChat(chatParticipation)
    }
            .subscribe()

    override fun rejectChatParticipants(chatId: String, pendingChatParticipantsRequest: PendingChatParticipantsRequest): Mono<Unit> {
        return mono {
            val pendingChatParticipations = pendingChatParticipationRepository.findByChatIdAndIdIn(
                    chatId = chatId,
                    ids = pendingChatParticipantsRequest.pendingChatParticipantsIds
            )
                    .collectList()
                    .awaitFirst()

            if (pendingChatParticipantsRequest.pendingChatParticipantsIds.size != pendingChatParticipations.size) {
                throw PendingChatParticipationNotFoundException(
                        "Could not find some of the specified pending chat participations"
                )
            }

            pendingChatParticipationRepository.deleteAll(pendingChatParticipations).awaitFirstOrNull()

            return@mono
        }
    }

    override fun findChatParticipationsByInvite(chatId: String, inviteId: String, paginationRequest: PaginationRequest): Flux<ChatParticipationResponse> {
        return mapChatParticipations(chatParticipationRepository.findByChatIdAndInviteIdAndDeletedFalse(
                chatId = chatId,
                inviteId = inviteId,
                pageable = paginationRequest.toPageRequest()
        ))
    }

    override fun findPendingChatParticipationsByInvite(chatId: String, inviteId: String, paginationRequest: PaginationRequest): Flux<PendingChatParticipationResponse> {
        return mono {
            val pendingChatParticipations = pendingChatParticipationRepository.findByChatIdAndInviteId(
                    chatId = chatId,
                    inviteId = inviteId,
                    pageable = paginationRequest.toPageRequest()
            )
                    .collectList()
                    .awaitFirst()

            return@mono mapPendingChatParticipations(pendingChatParticipations)
        }
                .flatMapMany { it }
    }

    override fun getMentionedChatParticipants(chatId: String, textInfo: TextInfo, excludedUsersIds: List<String>): Flux<ChatParticipation> {
        if (textInfo.userLinks.userLinksPositions.isEmpty()) {
            return Flux.empty()
        }

        return chatParticipationRepository.findByChatIdAndUserIdOrSlugIn(
                chatId = chatId,
                userIdsOrSlugs = textInfo.userLinks.userLinksPositions.map { userLink -> userLink.userIdOrSlug },
                includeDeleted = false,
                excludedUsersIds = excludedUsersIds
        )
    }

    private fun mapChatParticipations(
            chatParticipations: Flux<ChatParticipation>,
            usersCache: MutableMap<String, UserResponse> = mutableMapOf(),
            chatRole: ChatRole? = null
    ): Flux<ChatParticipationResponse> {
        return chatParticipations
                .flatMapSequential{ chatParticipation -> chatParticipationMapper.toChatParticipationResponse(
                        chatParticipation,
                        usersCache,
                        chatRole
                ) }
    }

    private fun mapPendingChatParticipations(pendingChatParticipations: List<PendingChatParticipation>): Flux<PendingChatParticipationResponse> {
        return mono {
            val usersIds = pendingChatParticipations.map { chatParticipation -> chatParticipation.userId }

            if (usersIds.isEmpty()) {
                return@mono Flux.empty()
            }

            val users = userCacheWrapper.findByIds(usersIds).collectList().awaitFirst()
            val usersCache = users.associate { user -> Pair(user.id, userMapper.toUserResponse(user)) }

            return@mono Flux.fromIterable(pendingChatParticipations.map { pendingChatParticipation ->
                chatParticipationMapper.toPendingChatParticipationResponse(pendingChatParticipation, usersCache)
            })
        }
                .flatMapMany { it }
    }

    private fun findChatById(chatId: String): Mono<Chat> {
        return chatRepository
                .findById(chatId)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $chatId")))
    }

    private fun findChatRole(id: String, chatId: String): Mono<ChatRole> = chatRoleRepository
            .findByIdAndChatId(id, chatId)
            .switchIfEmpty(Mono.error(ChatRoleNotFoundException("Could not find chat rile with id $id and chat id $chatId")))
}
