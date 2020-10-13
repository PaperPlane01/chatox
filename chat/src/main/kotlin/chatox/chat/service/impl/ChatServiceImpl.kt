package chatox.chat.service.impl

import chatox.chat.api.request.CreateChatRequest
import chatox.chat.api.request.UpdateChatRequest
import chatox.chat.api.response.AvailabilityResponse
import chatox.chat.api.response.ChatOfCurrentUserResponse
import chatox.chat.api.response.ChatResponse
import chatox.chat.exception.ChatNotFoundException
import chatox.chat.exception.SlugIsAlreadyInUseException
import chatox.chat.exception.UploadNotFoundException
import chatox.chat.mapper.ChatMapper
import chatox.chat.messaging.rabbitmq.event.publisher.ChatEventsPublisher
import chatox.chat.model.ChatMessagesCounter
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatRole
import chatox.chat.model.ImageUploadMetadata
import chatox.chat.model.Upload
import chatox.chat.model.UploadType
import chatox.chat.repository.ChatMessagesCounterRepository
import chatox.chat.repository.ChatParticipationRepository
import chatox.chat.repository.ChatRepository
import chatox.chat.repository.MessageRepository
import chatox.chat.repository.UploadRepository
import chatox.chat.security.AuthenticationFacade
import chatox.chat.security.access.ChatPermissions
import chatox.chat.service.ChatService
import chatox.chat.support.pagination.PaginationRequest
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime
import java.util.UUID

@Service
@Transactional
class ChatServiceImpl(private val chatRepository: ChatRepository,
                      private val chatParticipationRepository: ChatParticipationRepository,
                      private val messageRepository: MessageRepository,
                      private val uploadRepository: UploadRepository,
                      private val chatMessagesCounterRepository: ChatMessagesCounterRepository,
                      private val chatMapper: ChatMapper,
                      private val authenticationFacade: AuthenticationFacade,
                      private val chatEventsPublisher: ChatEventsPublisher) : ChatService {

    private lateinit var chatPermissions: ChatPermissions
    private val log = LoggerFactory.getLogger(this.javaClass)

    @Autowired
    fun setChatPermissions(chatPermissions: ChatPermissions) {
        this.chatPermissions = chatPermissions;
    }

    override fun createChat(createChatRequest: CreateChatRequest): Mono<ChatOfCurrentUserResponse> {
        return mono {
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val chatMessagesCounter = ChatMessagesCounter(
                    id = UUID.randomUUID().toString(),
                    chat = null,
                    messagesCount = 0L
            )
            val chat = chatMapper.fromCreateChatRequest(
                    createChatRequest = createChatRequest,
                    currentUser = currentUser,
                    messagesCounter = chatMessagesCounter
            )
            chatMessagesCounter.chat = chat
            chatMessagesCounterRepository.save(chatMessagesCounter).awaitFirst()
            chatRepository.save(chat).awaitFirst()

            var creatorDisplayedName = chat.createdBy.firstName

            if (chat.createdBy.lastName != null) {
                creatorDisplayedName = "$creatorDisplayedName ${chat.createdBy.lastName}"
            }

            val creatorChatParticipation = chatParticipationRepository.save(
                    chatParticipation = ChatParticipation(
                            user = chat.createdBy,
                            chat = chat,
                            role = ChatRole.ADMIN,
                            lastMessageRead = null,
                            createdAt = ZonedDateTime.now(),
                            userDisplayedName = creatorDisplayedName
                    )
            )
                    .awaitFirst()

            chatMapper.toChatOfCurrentUserResponse(
                    chat = chat,
                    chatParticipation = creatorChatParticipation,
                    unreadMessagesCount = 0,
                    lastMessage = null,
                    lastReadMessage = null,
                    onlineParticipantsCount = 1
            )
        }
    }

    override fun updateChat(id: String, updateChatRequest: UpdateChatRequest): Mono<ChatResponse> {
        return mono {
            assertCanUpdateChat(id).awaitFirst()
            var chat = chatRepository.findById(id).awaitFirst()

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
                ).awaitFirstOrNull()

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

    private fun assertCanUpdateChat(chatId: String): Mono<Boolean> {
        return chatPermissions.canUpdateChat(chatId)
                .flatMap {
                    if (it) {
                        Mono.just(it)
                    } else {
                        Mono.error<Boolean>(AccessDeniedException("Can't update chat"))
                    }
                }
    }

    override fun deleteChat(id: String): Mono<Void> {
        return assertCanDeleteChat(id)
                .flatMap {
                    chatRepository.findById(id)
                            .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $id")))
                            .zipWith(authenticationFacade.getCurrentUser())
                            .map { it.t1.copy(deleted = true, deletedAt = ZonedDateTime.now(), deletedBy = it.t2) }
                            .flatMap { chatRepository.save(it) }
                            .then()
                }
    }

    private fun assertCanDeleteChat(chatId: String): Mono<Boolean> {
        return chatPermissions.canDeleteChat(chatId)
                .flatMap {
                    if (it) {
                        Mono.just(it)
                    } else {
                        Mono.error<Boolean>(AccessDeniedException("Can't delete chat"))
                    }
                }
    }

    override fun findChatBySlugOrId(slugOrId: String): Mono<ChatResponse> {
        return chatRepository.findByIdEqualsOrSlugEquals(slugOrId, slugOrId)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id or slug $slugOrId")))
                .zipWith(authenticationFacade.getCurrentUser())
                .map { chatMapper.toChatResponse(it.t1, it.t2.id) }
    }

    override fun searchChats(query: String, paginationRequest: PaginationRequest): Flux<ChatResponse> {
        return chatRepository.findByNameContainsOrDescriptionContainsOrTagsContains(query, query, query, paginationRequest.toPageRequest())
                .map { chatMapper.toChatResponse(it) }
    }

    override fun getChatsOfCurrentUser(): Flux<ChatOfCurrentUserResponse> {
        return mono {
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val chatParticipations = chatParticipationRepository
                    .findAllByUserAndDeletedFalse(currentUser)
                    .collectList()
                    .awaitFirst()
            val unreadMessagesMap: MutableMap<String, Int> = HashMap()

            chatParticipations.forEach { chatParticipation ->
                unreadMessagesMap[chatParticipation.chat.id] = countUnreadMessages(Mono.just(chatParticipation))
                        .awaitFirst()
            }

            chatParticipations.map { chatParticipation ->
                chatMapper.toChatOfCurrentUserResponse(
                        chat = chatParticipation.chat,
                        chatParticipation = chatParticipation,
                        lastReadMessage = if (chatParticipation.lastMessageRead != null) chatParticipation.lastMessageRead!!.message else null,
                        lastMessage = chatParticipation.chat.lastMessage,
                        onlineParticipantsCount = chatParticipation.chat.numberOfOnlineParticipants,
                        unreadMessagesCount = unreadMessagesMap[chatParticipation.chat.id]!!
                )
            }
        }
                .flatMapMany { Flux.fromIterable(it) }
    }

    private fun countUnreadMessages(chatParticipation: Mono<ChatParticipation>): Mono<Int> {
        return chatParticipation.map {
            if (it.lastMessageRead != null) {
                val message = it.lastMessageRead!!.message

                if (message != message.chat.lastMessage) {
                    messageRepository.countByChatAndCreatedAtAfter(message.chat, message.createdAt)
                } else {
                    Mono.just(0)
                }
            } else {
                Mono.just(0)
            }
        }
                .flatMap { it }
    }

    override fun isChatCreatedByUser(chatId: String, userId: String): Mono<Boolean> {
        return chatRepository.findById(chatId)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $chatId")))
                .map { it.createdBy.id == userId }
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
                    .findAllBy(pageRequest)
                    .map { chat -> chatMapper.toChatResponse(chat = chat, currentUserId = currentUserId) }
        }
                .flatMapMany { chat -> chat }
    }

    fun createChatMessagesCounters(): Mono<Void> {
        log.info("Creating chat messages counters")
        return mono {
            val chats = chatRepository.findAll().collectList().awaitFirst()

            chats.forEach { chat ->
                log.info("Creating chat messages counter for chat ${chat.id}")
                val chatMessagesCounter = ChatMessagesCounter(
                        id = UUID.randomUUID().toString(),
                        chat = chat,
                        messagesCount = 0L
                )
                chatMessagesCounterRepository.save(chatMessagesCounter).awaitFirst()
                log.info("Chat messages counter for ${chat.id} has been created")
            }

            Mono.empty<Void>()
        }
                .flatMap { it }
    }

    fun populateChatMessageCounters(): Mono<Void> {
        log.info("Populating chat messages counters")
        return mono {
            val chats = chatRepository.findAll().collectList().awaitFirst()

            for (chat in chats) {
                log.info("Populating chat messages counter for chat ${chat.id}")
                val messages = messageRepository.findAllByChatOrderByCreatedAtAsc(chat).collectList().awaitFirst()

                for (message in messages) {
                    val nextCounterValue = chatMessagesCounterRepository.getNextCounterValue(chat).awaitFirst()
                    log.info("Next counter value for chat ${chat.id} is $nextCounterValue")
                    message.index = nextCounterValue
                    messageRepository.save(message).awaitFirst()
                }

                log.info("Populating chat messages counter for ${chat.id} has been finished")
            }

            log.info("Populating chat messages counters has been finished")
            Mono.empty<Void>()
        }
                .flatMap { it }
    }

    private fun getCorrectChatSortBy(sortBy: String?): String? {
        if (sortBy == null) {
            return null
        }

        return when (sortBy.trim().toLowerCase()) {
            "onlineParticipantsCount".toLowerCase() -> "numberOfOnlineParticipants"
            "participantsCount".toLowerCase() -> "numberOfParticipants"
            else -> sortBy
        }
    }
}
