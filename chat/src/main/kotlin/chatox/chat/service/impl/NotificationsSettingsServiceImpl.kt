package chatox.chat.service.impl

import chatox.chat.api.request.UpdateChatNotificationsSettingsRequest
import chatox.chat.api.request.UpdateGlobalNotificationsSettingsRequest
import chatox.chat.api.response.ChatNotificationsSettingsResponse
import chatox.chat.api.response.GlobalNotificationsSettingsResponse
import chatox.chat.config.CacheWrappersConfig
import chatox.chat.exception.ChatParticipationNotFoundException
import chatox.chat.exception.metadata.ChatNotFoundException
import chatox.chat.mapper.NotificationsSettingsMapper
import chatox.chat.model.Chat
import chatox.chat.model.GlobalNotificationSettings
import chatox.chat.model.NotificationsSettings
import chatox.chat.model.User
import chatox.chat.model.UserGlobalNotificationsSettings
import chatox.chat.model.UserNotificationSettings
import chatox.chat.repository.mongodb.ChatParticipationRepository
import chatox.chat.repository.mongodb.UserGlobalNotificationsSettingsRepository
import chatox.chat.service.NotificationsSettingsService
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class NotificationsSettingsServiceImpl(
        private val userGlobalNotificationsSettingsRepository: UserGlobalNotificationsSettingsRepository,
        private val chatParticipationRepository: ChatParticipationRepository,

        @Qualifier(CacheWrappersConfig.CHAT_BY_ID_CACHE_WRAPPER)
        private val chatCacheWrapper: ReactiveRepositoryCacheWrapper<Chat, String>,
        private val notificationsSettingsMapper: NotificationsSettingsMapper,
        private val authenticationHolder: ReactiveAuthenticationHolder<User>
) : NotificationsSettingsService {

    override fun getNotificationsSettingsOfCurrentUser(): Mono<GlobalNotificationsSettingsResponse> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val globalNotificationsSettings = userGlobalNotificationsSettingsRepository
                    .findById(currentUser.id)
                    .awaitFirstOrNull()
                    ?: GlobalNotificationSettings.DEFAULT
            val customChatSettings = chatParticipationRepository.findWithCustomNotificationsSettings(
                    currentUser.id
            )
                    .collectList()
                    .awaitFirst()

            return@mono notificationsSettingsMapper.toGlobalNotificationsSettingsResponse(
                    globalNotificationsSettings,
                    customChatSettings,
                    currentUser.id
            )
                    .awaitFirst()
        }
    }

    override fun updateGlobalNotificationsSettings(updateGlobalNotificationsSettingsRequest: UpdateGlobalNotificationsSettingsRequest): Mono<GlobalNotificationsSettingsResponse> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            var globalNotificationsSettings = userGlobalNotificationsSettingsRepository
                    .findById(currentUser.id)
                    .awaitFirstOrNull()
                    ?: UserGlobalNotificationsSettings(
                            id = currentUser.id,
                            groupChats = GlobalNotificationSettings.DEFAULT.groupChats,
                            dialogs = GlobalNotificationSettings.DEFAULT.dialogs
                    )

            globalNotificationsSettings = globalNotificationsSettings.copy(
                    groupChats = NotificationsSettings(
                            level = updateGlobalNotificationsSettingsRequest.groupChats.level,
                            sound = updateGlobalNotificationsSettingsRequest.groupChats.sound
                    ),
                    dialogs = NotificationsSettings(
                            level = updateGlobalNotificationsSettingsRequest.dialogChats.level,
                            sound = updateGlobalNotificationsSettingsRequest.dialogChats.sound
                    )
            )

            userGlobalNotificationsSettingsRepository.save(globalNotificationsSettings).awaitFirst()

            val customChatSettings = chatParticipationRepository.findWithCustomNotificationsSettings(
                    currentUser.id
            )
                    .collectList()
                    .awaitFirst()

            return@mono notificationsSettingsMapper.toGlobalNotificationsSettingsResponse(
                    globalNotificationsSettings,
                    customChatSettings,
                    currentUser.id
            )
                    .awaitFirst()
        }
    }

    override fun updateNotificationsSettingsForChat(chatId: String, updateChatNotificationsSettings: UpdateChatNotificationsSettingsRequest): Mono<ChatNotificationsSettingsResponse> {
        return mono {
            val chat = chatCacheWrapper.findById(chatId).awaitFirstOrNull() ?: throw ChatNotFoundException(
                    "Could not find chat with id $chatId"
            )

            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            var chatParticipation = chatParticipationRepository.findByChatIdAndUserIdAndDeletedFalse(
                    chatId = chatId,
                    userId = currentUser.id
            )
                    .awaitFirstOrNull() ?: throw ChatParticipationNotFoundException(
                            "Could not find chat participation of current user in chat $chatId"
                    )

            val notificationsSettings =  NotificationsSettings(
                    level = updateChatNotificationsSettings.level,
                    sound = updateChatNotificationsSettings.sound,
                    userExceptions = updateChatNotificationsSettings
                            .userExceptions
                            ?.map { (userId, userNotificationsSettings) -> userId to UserNotificationSettings(
                                    level = userNotificationsSettings.level,
                                    sound = userNotificationsSettings.sound
                            )}
                            ?.toMap()
            )
            chatParticipation = chatParticipation.copy(
                    notificationsSettings = notificationsSettings
            )

            chatParticipationRepository.save(chatParticipation).awaitFirst()

            return@mono notificationsSettingsMapper.toChatNotificationsSettingsResponse(
                    notificationsSettings = notificationsSettings,
                    chat = chat,
                    currentUserId = currentUser.id
            )
                    .awaitFirst()
        }
    }

    override fun deleteNotificationsSettingsForChat(chatId: String): Mono<Unit> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            var chatParticipation = chatParticipationRepository.findByChatIdAndUserIdAndDeletedFalse(
                    chatId = chatId,
                    userId = currentUser.id
            )
                    .awaitFirstOrNull() ?: throw ChatParticipationNotFoundException(
                    "Could not find chat participation of current user in chat $chatId"
            )

            chatParticipation = chatParticipation.copy(notificationsSettings = null)

            chatParticipationRepository.save(chatParticipation).awaitFirst()

            return@mono
        }
    }
}