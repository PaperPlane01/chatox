package chatox.chat.mapper

import chatox.chat.api.response.ChatBlockingResponse
import chatox.chat.api.response.ChatParticipationMinifiedResponse
import chatox.chat.api.response.ChatParticipationResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.config.CacheWrappersConfig
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatRole
import chatox.chat.model.DialogParticipant
import chatox.chat.repository.mongodb.ChatParticipationRepository
import chatox.chat.service.ChatBlockingService
import chatox.chat.support.UserDisplayedNameHelper
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Component
class ChatParticipationMapper(private val userMapper: UserMapper,
                              private val chatRoleMapper: ChatRoleMapper,
                              private val chatParticipationRepository: ChatParticipationRepository,
                              private val userDisplayedNameHelper: UserDisplayedNameHelper,

                              @Qualifier(CacheWrappersConfig.CHAT_ROLE_CACHE_WRAPPER)
                              private val chatRoleCacheWrapper: ReactiveRepositoryCacheWrapper<ChatRole, String>) {

    private lateinit var chatBlockingService: ChatBlockingService

    @Autowired
    fun setChatBlockingService(chatBlockingService: ChatBlockingService) {
        this.chatBlockingService = chatBlockingService
    }

    fun toMinifiedChatParticipationResponse(chatParticipation: ChatParticipation, updateChatBlockingStatusIfNecessary: Boolean = false): Mono<ChatParticipationMinifiedResponse> {
        return mono {
            var activeChatBlocking: ChatBlockingResponse? = null
            val lastChatBlockingId = chatParticipation.lastActiveChatBlockingId

            if (lastChatBlockingId != null) {
               val chatBlocking = chatBlockingService.findChatBlockingById(lastChatBlockingId).awaitFirst()

                if (chatBlocking.canceled || ZonedDateTime.now().isAfter(chatBlocking.blockedUntil)) {
                    if (updateChatBlockingStatusIfNecessary) {
                        chatParticipationRepository.save(chatParticipation.copy(
                                lastActiveChatBlockingId = null
                        )).subscribe()
                    }
                } else {
                    activeChatBlocking = chatBlocking
                }
            }

            val role = chatRoleMapper.toChatRoleResponse(
                    chatRoleCacheWrapper.findById(chatParticipation.roleId).awaitFirst()
            )

            return@mono ChatParticipationMinifiedResponse(
                    id = chatParticipation.id,
                    role = role,
                    activeChatBlocking = activeChatBlocking
            )
        }
    }

    fun toChatParticipationResponse(
            chatParticipation: ChatParticipation,
            localUsersCache: MutableMap<String, UserResponse> = mutableMapOf(),
            chatRole: ChatRole? = null
    ): Mono<ChatParticipationResponse> {
       return mono {
           val mappedRole = chatRole ?: chatRoleCacheWrapper.findById(chatParticipation.roleId).awaitFirst()
           val roleResponse = chatRoleMapper.toChatRoleResponseAsync(
                   chatRole = mappedRole,
                   localUsersCache = localUsersCache
           )
                   .awaitFirst()

           return@mono ChatParticipationResponse(
                   id = chatParticipation.id,
                   user = userMapper.toUserResponse(chatParticipation.user),
                   chatId = chatParticipation.chatId,
                   role = roleResponse
           )
       }
    }

    fun toDialogParticipant(chatParticipation: ChatParticipation) = DialogParticipant(
            id = chatParticipation.id,
            userId = chatParticipation.user.id,
            userSlug = chatParticipation.user.slug,
            userDisplayedName = userDisplayedNameHelper.getDisplayedName(chatParticipation.user)
    )
}
