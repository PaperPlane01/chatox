package chatox.chat.security.access

import chatox.chat.api.request.CreateChatRoleRequest
import chatox.chat.api.request.UpdateChatRoleRequest
import chatox.chat.model.ChatFeatures
import chatox.chat.security.AuthenticationFacade
import chatox.chat.service.ChatRoleService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class ChatRolePermissions(private val chatRoleService: ChatRoleService,
                          private val authenticationFacade: AuthenticationFacade) {

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
            val currentUser = authenticationFacade.getCurrentUserDetails().awaitFirst()
            val currentUserChatRole = chatRoleService.getRoleOfUserInChat(userId = currentUser.id, chatId = chatId).awaitFirstOrNull()
                    ?: return@mono false

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