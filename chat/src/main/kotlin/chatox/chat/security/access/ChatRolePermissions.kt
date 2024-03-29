package chatox.chat.security.access

import chatox.chat.api.request.CreateChatRoleRequest
import chatox.chat.api.request.UpdateChatRoleRequest
import chatox.chat.model.ChatFeatures
import chatox.chat.model.User
import chatox.chat.service.ChatRoleService
import chatox.chat.service.ChatService
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class ChatRolePermissions(private val chatRoleService: ChatRoleService,
                          private val authenticationHolder: ReactiveAuthenticationHolder<User>,
                          private val chatService: ChatService) {

    fun canCreateChatRole(chatId: String, createChatRoleRequest: CreateChatRoleRequest) = canCreateOrUpdateRoleWithFeatures(
            chatId,
            createChatRoleRequest.features
    )

    fun canUpdateChatRole(chatId: String, updateChatRoleRequest: UpdateChatRoleRequest) = canCreateOrUpdateRoleWithFeatures(
            chatId,
            updateChatRoleRequest.features
    )

    private fun canCreateOrUpdateRoleWithFeatures(chatId: String, features: ChatFeatures): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val currentUserChatRole = chatRoleService.getRoleOfUserInChat(userId = currentUser.id, chatId = chatId).awaitFirstOrNull()
                    ?: return@mono false
            val chat = chatService.findChatById(chatId).awaitFirst()

            if (currentUser.id == chat.createdById) {
                return@mono true
            }

            if (!currentUserChatRole.features.modifyChatRoles.enabled) {
                return@mono false
            }

            return@mono checkAssignedFeatures(currentUserChatRole.features, features)
        }
    }

    private fun checkAssignedFeatures(currentUserChatFeatures: ChatFeatures, assignedFeatures: ChatFeatures): Boolean {
        val enabledFeaturesOfCurrentUser = currentUserChatFeatures.enabled
        val enabledFeaturesOfNewRole = assignedFeatures.enabled

        return enabledFeaturesOfCurrentUser.containsAll(enabledFeaturesOfNewRole)
    }
}