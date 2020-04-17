package chatox.chat.service.impl

import chatox.chat.api.request.CreateChatBlockingRequest
import chatox.chat.api.request.UpdateChatBlockingRequest
import chatox.chat.api.response.ChatBlockingResponse
import chatox.chat.exception.ChatBlockingNotFoundException
import chatox.chat.exception.ChatNotFoundException
import chatox.chat.exception.UserNotFoundException
import chatox.chat.mapper.ChatBlockingMapper
import chatox.chat.model.Chat
import chatox.chat.model.ChatBlocking
import chatox.chat.model.User
import chatox.chat.repository.ChatBlockingRepository
import chatox.chat.repository.ChatRepository
import chatox.chat.repository.UserRepository
import chatox.chat.security.AuthenticationFacade
import chatox.chat.security.access.ChatBlockingPermissions
import chatox.chat.service.ChatBlockingService
import chatox.chat.support.pagination.PaginationRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Service
@Transactional
class ChatBlockingServiceImpl(private val chatBlockingRepository: ChatBlockingRepository,
                              private val chatRepository: ChatRepository,
                              private val userRepository: UserRepository,
                              private val authenticationFacade: AuthenticationFacade,
                              private val chatBlockingMapper: ChatBlockingMapper) : ChatBlockingService {
    private lateinit var chatBlockingPermissions: ChatBlockingPermissions

    @Autowired
    fun setChatBlockingPermissions(chatBlockingPermissions: ChatBlockingPermissions) {
        this.chatBlockingPermissions = chatBlockingPermissions;
    }

    override fun blockUser(chatId: String, createChatBlockingRequest: CreateChatBlockingRequest): Mono<ChatBlockingResponse> {
        return this.assertCanBlockUser(chatId)
                .flatMap { authenticationFacade.getCurrentUser() }
                .zipWith(findChatById(chatId))
                .zipWith(findUserById(createChatBlockingRequest.userId))
                .map { chatBlockingMapper.fromCreateChatBlockingRequest(
                        createChatBlockingRequest = createChatBlockingRequest,
                        currentUser = it.t1.t1,
                        chat = it.t1.t2,
                        blockedUser = it.t2
                ) }
                .flatMap { chatBlockingRepository.save(it) }
                .map { chatBlockingMapper.toChatBlockingResponse(it) }
    }

    private fun assertCanBlockUser(chatId: String): Mono<Boolean> {
        return chatBlockingPermissions.canBlockUser(chatId)
                .flatMap {
                    if (!it) {
                        Mono.error<Boolean>(AccessDeniedException("Can't block user in chat"))
                    } else {
                        Mono.just(it)
                    }
                }
    }

    override fun unblockUser(chatId: String, blockingId: String): Mono<ChatBlockingResponse> {
        return assertCanUnblockUser(chatId)
                .flatMap { authenticationFacade.getCurrentUser() }
                .zipWith(findBlockingById(blockingId))
                .map {
                    val cancelDate = ZonedDateTime.now()
                    it.t2.copy(
                            canceled = true,
                            canceledBy = it.t1,
                            canceledAt = cancelDate,
                            lastModifiedAt = cancelDate,
                            lastModifiedBy = it.t1
                    )
                }
                .flatMap { chatBlockingRepository.save(it) }
                .map { chatBlockingMapper.toChatBlockingResponse(it) }
    }

    private fun assertCanUnblockUser(chatId: String): Mono<Boolean> {
        return chatBlockingPermissions.canUnblockUser(chatId)
                .flatMap {
                    if (!it) {
                        Mono.error<Boolean>(AccessDeniedException("Can't unblock user"))
                    } else {
                        Mono.just(it)
                    }
                }

    }

    override fun updateBlocking(chatId: String, blockingId: String, updateBlockingRequest: UpdateChatBlockingRequest): Mono<ChatBlockingResponse> {
        return assertCanUpdateBlocking(chatId)
                .flatMap { authenticationFacade.getCurrentUser() }
                .zipWith(findBlockingById(blockingId))
                .map { chatBlockingMapper.mapChatBlockingUpdate(
                        chatBlocking = it.t2,
                        currentUser = it.t1,
                        updateChatBlockingRequest = updateBlockingRequest
                ) }
                .flatMap { chatBlockingRepository.save(it) }
                .map { chatBlockingMapper.toChatBlockingResponse(it) }
    }

    private fun assertCanUpdateBlocking(chatId: String): Mono<Boolean> {
        return chatBlockingPermissions.canUpdateBlocking(chatId)
                .flatMap {
                    if (!it) {
                        Mono.error<Boolean>(AccessDeniedException("Can't update chat blocking"))
                    } else {
                        Mono.just(it)
                    }
                }
    }

    override fun getBlockingById(chatId: String, blockingId: String): Mono<ChatBlockingResponse> {
        return assertCanSeeBlockings(chatId)
                .flatMap { findBlockingById(blockingId) }
                .map { chatBlockingMapper.toChatBlockingResponse(it) }
    }

    override fun getActiveBlockingsByChat(chatId: String, paginationRequest: PaginationRequest): Flux<ChatBlockingResponse> {
        return assertCanSeeBlockings(chatId)
                .flatMap { findChatById(chatId) }
                .flatMapMany { chatBlockingRepository.findByChatAndBlockedUntilAfterAndCanceled(
                        chat = it,
                        canceled = false,
                        date = ZonedDateTime.now(),
                        pageable = paginationRequest.toPageRequest()
                ) }
                .map { chatBlockingMapper.toChatBlockingResponse(it) }

    }

    override fun getNonActiveBlockingsByChat(chatId: String, paginationRequest: PaginationRequest): Flux<ChatBlockingResponse> {
        return assertCanSeeBlockings(chatId)
                .flatMap { findChatById(chatId) }
                .flatMapMany { chatBlockingRepository.findByChatAndBlockedUntilBeforeOrCanceled(
                        chat = it,
                        canceled = true,
                        date = ZonedDateTime.now(),
                        pageable = paginationRequest.toPageRequest()
                ) }
                .map { chatBlockingMapper.toChatBlockingResponse(it) }
    }

    override fun getAllBlockingsByChat(chatId: String, paginationRequest: PaginationRequest): Flux<ChatBlockingResponse> {
        return assertCanSeeBlockings(chatId)
                .flatMap { findChatById(chatId) }
                .flatMapMany { chatBlockingRepository.findByChat(it, paginationRequest.toPageRequest()) }
                .map { chatBlockingMapper.toChatBlockingResponse(it) }
    }

    override fun isUserBlockedInChat(chatId: String, user: User): Mono<Boolean> {
        return findChatById(chatId)
                .map { chatBlockingRepository.findByChatAndBlockedUserAndBlockedUntilAfterAndCanceled(
                        chat = it,
                        blockedUser = user,
                        canceled = false,
                        date = ZonedDateTime.now()
                )}
                .flatMapMany { it }
                .collectList()
                .map { it.isNotEmpty() }
    }

    private fun assertCanSeeBlockings(chatId: String): Mono<Boolean> {
        return chatBlockingPermissions.canSeeChatBlockings(chatId)
                .flatMap {
                    if (!it) {
                        Mono.error<Boolean>(AccessDeniedException("Can't watch blockings in this chat"))
                    } else {
                        Mono.just(it)
                    }
                }
    }

    private fun findChatById(chatId: String): Mono<Chat> {
        return chatRepository.findById(chatId)
                .switchIfEmpty(Mono.error(ChatNotFoundException("Could not find chat with id $chatId")))
    }

    private fun findUserById(userId: String): Mono<User> {
        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(UserNotFoundException("Could not find user with id $userId")))
    }

    private fun findBlockingById(blockingId: String): Mono<ChatBlocking> {
        return chatBlockingRepository.findById(blockingId)
                .switchIfEmpty(Mono.error(ChatBlockingNotFoundException("Could not find chat blocking with id $blockingId")))
    }
}