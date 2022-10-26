package chatox.chat.mapper

import chatox.chat.api.response.ChatRoleResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.model.ChatRole
import chatox.chat.model.User
import chatox.chat.service.UserService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class ChatRoleMapper(private val userMapper: UserMapper,
                     private val userService: UserService) {

    fun toChatRoleResponse(chatRole: ChatRole, createdBy: User? = null, updatedBy: User? = null) = toChatRoleResponse(
            chatRole = chatRole,
            createdBy = if (createdBy != null) {
                userMapper.toUserResponse(createdBy)
            } else null,
            updatedBy = if (updatedBy != null) {
                userMapper.toUserResponse(updatedBy)
            } else null
    )

    fun toChatRoleResponseAsync(chatRole: ChatRole, localUsersCache: MutableMap<String, UserResponse> = mutableMapOf()): Mono<ChatRoleResponse> {
        return mono {
            val createdBy: UserResponse? = if (chatRole.createdBy == null) {
                null
            } else {
                if (localUsersCache.containsKey(chatRole.createdBy)) {
                    localUsersCache[chatRole.createdBy]!!
                } else {
                    userService.findUserByIdAndPutInLocalCache(chatRole.createdBy!!, localUsersCache).awaitFirst()
                }
            }
            val updatedBy = if (chatRole.updatedBy == null) {
                null
            } else {
                if (localUsersCache.containsKey(chatRole.updatedBy)) {
                    localUsersCache[chatRole.createdBy]!!
                } else {
                    userService.findUserByIdAndPutInLocalCache(chatRole.updatedBy!!, localUsersCache).awaitFirst()
                }
            }

            return@mono toChatRoleResponse(
                    chatRole = chatRole,
                    createdBy = createdBy,
                    updatedBy = updatedBy
            )
        }
    }

    private fun toChatRoleResponse(chatRole: ChatRole, createdBy: UserResponse?, updatedBy: UserResponse?) = ChatRoleResponse(
            id = chatRole.id,
            features = chatRole.features,
            chatId = chatRole.chatId,
            default = chatRole.default,
            createdAt = chatRole.createdAt,
            createdBy = createdBy,
            updatedAt = chatRole.updatedAt,
            updatedBy = updatedBy,
            templateId = chatRole.templateId,
            level = chatRole.level,
            name = chatRole.name
    )
}