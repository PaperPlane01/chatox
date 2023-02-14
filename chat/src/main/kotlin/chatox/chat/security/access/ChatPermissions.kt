package chatox.chat.security.access

import chatox.chat.model.User
import chatox.chat.model.UserBlacklistItem
import chatox.chat.service.ChatRoleService
import chatox.chat.service.ChatService
import chatox.chat.util.generateCacheBlacklistItemCacheId
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class ChatPermissions(private val chatRoleService: ChatRoleService,
                      private val authenticationHolder: ReactiveAuthenticationHolder<User>,
                      private val userBlacklistItemCacheWrapper: ReactiveRepositoryCacheWrapper<UserBlacklistItem, String>) {
    private lateinit var chatService: ChatService

    @Autowired
    fun setChatService(chatService: ChatService) {
        this.chatService = chatService
    }

    fun canUpdateChat(chatId: String): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val userRole = chatRoleService.getRoleOfUserInChat(userId = currentUser.id, chatId = chatId).awaitFirstOrNull()
                    ?: return@mono false

            return@mono userRole.features.changeChatSettings.enabled
        }
    }

    fun canDeleteChat(chatId: String): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val chatCreatedByCurrentUser = chatService.isChatCreatedByUser(
                    chatId = chatId,
                    userId = currentUser.id
            )
                    .awaitFirst()

            return@mono chatCreatedByCurrentUser || currentUser.isAdmin
        }
    }

    fun canCreateChat(): Mono<Boolean> {
        return authenticationHolder.requireCurrentUserDetails()
                .map { user -> !user.isBannedGlobally }
    }

    fun canStartPrivateChat(userId: String): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val blacklistItem = userBlacklistItemCacheWrapper.findById(generateCacheBlacklistItemCacheId(
                    userId = currentUser.id,
                    blacklistedById = userId
            ))
                    .awaitFirstOrNull()

            return@mono blacklistItem == null && !currentUser.isBannedGlobally
        }
    }
}
