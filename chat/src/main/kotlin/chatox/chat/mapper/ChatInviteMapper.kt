package chatox.chat.mapper

import chatox.chat.api.response.ChatInviteFullResponse
import chatox.chat.api.response.ChatInviteResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.model.Chat
import chatox.chat.model.ChatInvite
import chatox.chat.service.UserService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Component
class ChatInviteMapper(private val chatMapper: ChatMapper,
                       private val userService: UserService) {

    fun toChatInviteResponse(chatInvite: ChatInvite, chat: Chat): ChatInviteResponse =  ChatInviteResponse(
            id = chatInvite.id,
            chat = chatMapper.toChatResponse(chat)
    )

    fun mapChatInvites(
            chatInvites: Flux<ChatInvite>,
            localUsersCache: MutableMap<String, UserResponse> = mutableMapOf()
    ): Flux<ChatInviteFullResponse> = chatInvites
            .flatMapSequential { chatInvite -> toChatInviteFullResponse(chatInvite, localUsersCache) }

    fun toChatInviteFullResponse(
            chatInvite: ChatInvite,
            localUsersCache: MutableMap<String, UserResponse> = mutableMapOf()
    ): Mono<ChatInviteFullResponse> = mono {
        val createdBy = userService
                .findUserByIdAndPutInLocalCache(chatInvite.createdBy, localUsersCache)
                .awaitFirst()
        val updatedBy = userService
                .findUserByIdAndPutInLocalCache(chatInvite.updatedBy, localUsersCache)
                .awaitFirstOrNull()
        val user = userService
                .findUserByIdAndPutInLocalCache(chatInvite.userId, localUsersCache)
                .awaitFirstOrNull()
        val lastUsedBy = userService
                .findUserByIdAndPutInLocalCache(chatInvite.lastUsedById, localUsersCache)
                .awaitFirstOrNull()

        return@mono ChatInviteFullResponse(
                id = chatInvite.id,
                chatId = chatInvite.chatId,
                name = chatInvite.name,
                createdAt = chatInvite.createdAt,
                createdBy = createdBy,
                updatedAt = chatInvite.updatedAt,
                updatedBy = updatedBy,
                lastUsedAt = chatInvite.lastUsedAt,
                lastUsedBy = lastUsedBy,
                user = user,
                expiresAt = chatInvite.expiresAt,
                maxUseTimes = chatInvite.maxUseTimes,
                useTimes = chatInvite.useTimes,
                active = chatInvite.active,
                joinAllowanceSettings = chatInvite.joinAllowanceSettings
        )
    }
}