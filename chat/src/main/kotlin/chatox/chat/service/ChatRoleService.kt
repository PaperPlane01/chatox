package chatox.chat.service

import chatox.chat.api.request.CreateChatRoleRequest
import chatox.chat.api.request.UpdateChatRoleRequest
import chatox.chat.api.response.ChatRoleResponse
import chatox.chat.model.Chat
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatRole
import chatox.chat.util.NTuple2
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatRoleService {
    fun getRoleOfUserInChat(userId: String, chatId: String): Mono<ChatRole>
    fun getRoleAndChatParticipationOfUserInChat(userId: String, chatId: String): Mono<NTuple2<ChatRole, ChatParticipation>>
    fun findRoleByIdAndChatId(roleId: String, chatId: String): Mono<ChatRole>
    fun createRolesForChat(chat: Chat): Flux<ChatRole>
    fun createUserRoleForChat(chat: Chat): Mono<ChatRole>
    fun findRolesByChat(chatId: String): Flux<ChatRoleResponse>
    fun createChatRole(chatId: String, createChatRoleRequest: CreateChatRoleRequest): Mono<ChatRoleResponse>
    fun updateChatRole(chatId: String, roleId: String, updateChatRoleRequest: UpdateChatRoleRequest): Mono<ChatRoleResponse>
}