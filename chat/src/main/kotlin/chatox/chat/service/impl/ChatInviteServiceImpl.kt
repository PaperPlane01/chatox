package chatox.chat.service.impl

import chatox.chat.api.request.CreateChatInviteRequest
import chatox.chat.api.request.UpdateChatInviteRequest
import chatox.chat.api.response.ChatInviteFullResponse
import chatox.chat.api.response.ChatInviteResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.config.CacheWrappersConfig
import chatox.chat.exception.ChatInviteNotFoundException
import chatox.chat.exception.UserNotFoundException
import chatox.chat.exception.metadata.ChatNotFoundException
import chatox.chat.mapper.ChatInviteMapper
import chatox.chat.model.Chat
import chatox.chat.model.ChatInvite
import chatox.chat.model.User
import chatox.chat.repository.mongodb.ChatInviteRepository
import chatox.chat.service.ChatInviteService
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.pagination.PaginationRequest
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.bson.types.ObjectId
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Service
class ChatInviteServiceImpl(
        private val chatInviteRepository: ChatInviteRepository,
        private val chatInviteCacheWrapper: ReactiveRepositoryCacheWrapper<ChatInvite, String>,

        @Qualifier(CacheWrappersConfig.CHAT_BY_ID_CACHE_WRAPPER)
        private val chatCacheWrapper: ReactiveRepositoryCacheWrapper<Chat, String>,
        private val userCacheWrapper: ReactiveRepositoryCacheWrapper<User, String>,
        private val chatInviteMapper: ChatInviteMapper,
        private val authenticationHolder: ReactiveAuthenticationHolder<User>) : ChatInviteService {

    override fun findChatInvite(id: String): Mono<ChatInviteResponse> {
        return mono {
            val chatInvite = chatInviteRepository.findById(id, true).awaitFirstOrNull()
                    ?: throw ChatInviteNotFoundException(id)
            val chat = chatCacheWrapper.findById(chatInvite.chatId).awaitFirstOrNull()
                    ?: throw ChatInviteNotFoundException(id)

            return@mono chatInviteMapper.toChatInviteResponse(
                    chatInvite = chatInvite,
                    chat = chat
            )
        }
    }

    override fun findFullChatInvite(chatId: String, id: String): Mono<ChatInviteFullResponse> {
        return mono {
            val chatInvite = chatInviteRepository.findByIdAndChatId(
                    id = id,
                    chatId = chatId,
                    activeOnly = false
            )
                    .awaitFirstOrNull() ?: throw ChatInviteNotFoundException(id)

            return@mono chatInviteMapper.toChatInviteFullResponse(chatInvite).awaitFirst()
        }
    }

    override fun findChatInvites(chatId: String, activeOnly: Boolean, paginationRequest: PaginationRequest): Flux<ChatInviteFullResponse> {
        val usersCache = mutableMapOf<String, UserResponse>()

        return chatInviteRepository.findByChatId(
                chatId = chatId,
                activeOnly = activeOnly,
                pageable = paginationRequest.toPageRequest()
        )
                .flatMapSequential { chatInvite -> chatInviteMapper.toChatInviteFullResponse(chatInvite, usersCache) }
    }

    override fun createChatInvite(chatId: String, createChatInviteRequest: CreateChatInviteRequest): Mono<ChatInviteFullResponse> {
        return mono {
            assertChatExists(chatId).awaitFirstOrNull()

            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()

            if (createChatInviteRequest.userId != null) {
                assertUserExists(createChatInviteRequest.userId).awaitFirstOrNull()
            }

            val chatInvite = ChatInvite(
                    id = ObjectId().toHexString(),
                    chatId = chatId,
                    name = createChatInviteRequest.name,
                    createdAt = ZonedDateTime.now(),
                    createdBy = currentUser.id,
                    userId = createChatInviteRequest.userId,
                    maxUseTimes = createChatInviteRequest.maxUseTimes,
                    expiresAt = createChatInviteRequest.expiresAt,
                    active = createChatInviteRequest.active ?: false,
                    joinAllowanceSettings = createChatInviteRequest.joinAllowanceSettings ?: mapOf()
            )

            chatInviteRepository.save(chatInvite).awaitFirst()

            return@mono chatInviteMapper.toChatInviteFullResponse(chatInvite).awaitFirst()
        }
    }

    override fun updateChatInvite(id: String, chatId: String, updateChatInviteRequest: UpdateChatInviteRequest): Mono<ChatInviteFullResponse> {
        return mono {
            var chatInvite = chatInviteCacheWrapper.findById(id).awaitFirstOrNull()
                    ?: throw ChatInviteNotFoundException(id)

            if (chatInvite.chatId != chatId) {
                throw ChatInviteNotFoundException(id)
            }

            if (updateChatInviteRequest.userId != null && updateChatInviteRequest.userId != chatInvite.userId) {
                assertUserExists(updateChatInviteRequest.userId).awaitFirstOrNull()
            }

            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()

            chatInvite = chatInvite.copy(
                    active = updateChatInviteRequest.active ?: false,
                    name = updateChatInviteRequest.name,
                    expiresAt = updateChatInviteRequest.expiresAt,
                    maxUseTimes = updateChatInviteRequest.maxUseTimes,
                    userId = updateChatInviteRequest.userId,
                    joinAllowanceSettings = updateChatInviteRequest.joinAllowanceSettings ?: mapOf(),
                    updatedAt = ZonedDateTime.now(),
                    updatedBy = currentUser.id
            )

            chatInviteRepository.save(chatInvite).awaitFirst()

            return@mono chatInviteMapper.toChatInviteFullResponse(chatInvite, mutableMapOf()).awaitFirst()
        }
    }

    private fun assertChatExists(chatId: String): Mono<Unit> {
        return mono {
            val chat = chatCacheWrapper.findById(chatId).awaitFirstOrNull()

            if (chat == null || chat.deleted) {
                throw ChatNotFoundException("Could not find chat with id $chatId")
            }
        }
    }

    private fun assertUserExists(userId: String): Mono<Unit> {
        return mono {
            val user = userCacheWrapper.findById(userId).awaitFirstOrNull()

            if (user == null || user.deleted) {
                throw UserNotFoundException("Could not find user with id $userId")
            }
        }
    }
}