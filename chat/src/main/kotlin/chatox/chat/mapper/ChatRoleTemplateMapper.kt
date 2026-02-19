package chatox.chat.mapper

import chatox.chat.api.response.ChatRoleTemplateResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.model.ChatRoleTemplate
import chatox.chat.service.UserService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class ChatRoleTemplateMapper(private val userService: UserService) {

    fun toChatRoleTemplateResponse(
        chatRoleTemplate: ChatRoleTemplate,
        localUsersCache: MutableMap<String, UserResponse>
    ): Mono<ChatRoleTemplateResponse> {
        return mono {
            return@mono ChatRoleTemplateResponse(
                id = chatRoleTemplate.id,
                features = chatRoleTemplate.features,
                name = chatRoleTemplate.name,
                createdAt = chatRoleTemplate.createdAt,
                createdBy = chatRoleTemplate.createdBy?.let {
                    userService.findUserByIdAndPutInLocalCache(it, localUsersCache).awaitFirst()
                },
                updatedAt = chatRoleTemplate.updatedAt,
                updatedBy = chatRoleTemplate.updatedBy?.let {
                    userService.findUserByIdAndPutInLocalCache(it, localUsersCache).awaitFirst()
                }
            )
        }
    }
}