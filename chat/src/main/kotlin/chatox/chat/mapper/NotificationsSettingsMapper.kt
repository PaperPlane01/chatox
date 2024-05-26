package chatox.chat.mapper

import chatox.chat.api.response.ChatNotificationsSettingsResponse
import chatox.chat.api.response.GlobalNotificationsSettingsResponse
import chatox.chat.api.response.NotificationsSettingsResponse
import chatox.chat.api.response.UserNotificationsSettingsResponse
import chatox.chat.config.CacheWrappersConfig
import chatox.chat.model.Chat
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatType
import chatox.chat.model.GlobalNotificationSettings
import chatox.chat.model.NotificationsSettings
import chatox.chat.model.User
import chatox.chat.repository.mongodb.ChatParticipationRepository
import chatox.chat.util.mapTo3Lists
import chatox.chat.util.splitTo2Lists
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class NotificationsSettingsMapper(
        @Qualifier(CacheWrappersConfig.CHAT_BY_ID_CACHE_WRAPPER)
        private val chatCacheWrapper: ReactiveRepositoryCacheWrapper<Chat, String>,
        private val userCacheWrapper: ReactiveRepositoryCacheWrapper<User, String>,
        private val chatParticipationRepository: ChatParticipationRepository,
        private val chatMapper: ChatMapper,
        private val userMapper: UserMapper) {

    fun toGlobalNotificationsSettingsResponse(
            globalNotificationsSettings: GlobalNotificationSettings,
            exceptions: List<ChatParticipation>,
            currentUserId: String
    ): Mono<GlobalNotificationsSettingsResponse> = mono {
        val (chatsIds, notificationsSettingsPairs, userExceptionsMaps) = mapTo3Lists(
                exceptions,
                { chatParticipation -> chatParticipation.chatId },
                { chatParticipation -> Pair(chatParticipation.chatId, chatParticipation.notificationsSettings!!) },
                { chatParticipation -> chatParticipation.notificationsSettings!!.userExceptions ?: mapOf() }
        )
        val notificationsSettingsMap = notificationsSettingsPairs.toMap()
        val usersIds = userExceptionsMaps.flatMap { it.keys.toList() }

        val chats = chatCacheWrapper.findByIds(chatsIds).collectList().awaitFirst()
        val userExceptions = userCacheWrapper.findByIds(usersIds)
                .collectList()
                .awaitFirst()
                .associateBy { user -> user.id }

        val (groupChats, dialogChats) = splitTo2Lists(
                chats,
                { chat -> chat.type == ChatType.GROUP },
                { chat -> chat.type == ChatType.DIALOG }
        )

        val dialogChatsIds = dialogChats.map { chat -> chat.id }
        val dialogParticipants = chatParticipationRepository.findByChatIdIn(dialogChatsIds)
                .collectList()
                .awaitFirst()
                .groupBy { chatParticipation -> chatParticipation.chatId }

        val groupChatsExceptions = getGroupChatsExceptions(
                groupChats,
                notificationsSettingsMap,
                userExceptions
        )
        val dialogChatsExceptions = getDialogChatsExceptions(
                dialogChats,
                notificationsSettingsMap,
                dialogParticipants,
                currentUserId
        )

        return@mono GlobalNotificationsSettingsResponse(
                groupChats = NotificationsSettingsResponse(
                        level = globalNotificationsSettings.groupChats.level,
                        sound = globalNotificationsSettings.groupChats.sound
                ),
                groupChatsExceptions = groupChatsExceptions,
                dialogs = NotificationsSettingsResponse(
                        level = globalNotificationsSettings.dialogs.level,
                        sound = globalNotificationsSettings.dialogs.sound
                ),
                dialogChatsExceptions = dialogChatsExceptions
        )
    }

    private fun getGroupChatsExceptions(
            groupChats: List<Chat>,
            notificationsSettingsMap: Map<String, NotificationsSettings>,
            userExceptions: Map<String, User>
    ) = groupChats.map { chat ->
        val chatNotificationsSettings = notificationsSettingsMap[chat.id]!!
        val chatUserExceptions = chatNotificationsSettings.userExceptions
                ?.map { (userId, settings) ->
                    val user = userMapper.toUserResponse(userExceptions[userId]!!)

                    UserNotificationsSettingsResponse(
                            user = user,
                            notificationsSettings = NotificationsSettingsResponse(
                                    level = settings.level,
                                    sound = settings.sound
                            )
                    )
                }

        return@map ChatNotificationsSettingsResponse(
                chat = chatMapper.toChatResponse(chat),
                notificationsSettings = NotificationsSettingsResponse(
                        level = chatNotificationsSettings.level,
                        sound = chatNotificationsSettings.sound
                ),
                userExceptions = chatUserExceptions ?: listOf()
        )
    }

    private fun getDialogChatsExceptions(
            dialogChats: List<Chat>,
            notificationsSettingsMap: Map<String, NotificationsSettings>,
            dialogParticipants: Map<String, List<ChatParticipation>>,
            currentUserId: String
    ) = dialogChats.map { chat ->
            val notificationSettings = notificationsSettingsMap[chat.id]!!
            val chatParticipants = dialogParticipants[chat.id]!!

            val users = chatParticipants.map { chatParticipant -> chatParticipant.user }

            var otherUser = users.find { user -> user.id != currentUserId }

            if (otherUser == null) {
                otherUser = users[0]
            }

            return@map ChatNotificationsSettingsResponse(
                    chat = chatMapper.toChatResponse(
                            chat = chat,
                            user = otherUser
                    ),
                    notificationsSettings = NotificationsSettingsResponse(
                            level = notificationSettings.level,
                            sound = notificationSettings.sound
                    )
            )
        }

    fun toChatNotificationsSettingsResponse(
            notificationsSettings: NotificationsSettings,
            chat: Chat,
            currentUserId: String
    ): Mono<ChatNotificationsSettingsResponse> {
        return if (chat.type == ChatType.DIALOG) {
            toChatNotificationsSettingsResponseForDialog(
                    notificationsSettings,
                    chat,
                    currentUserId
            )
        } else {
            toChatNotificationsSettingsResponseForGroupChat(
                    notificationsSettings,
                    chat
            )
        }
    }

    private fun toChatNotificationsSettingsResponseForDialog(
            notificationsSettings: NotificationsSettings,
            chat: Chat,
            currentUserId: String
    ): Mono<ChatNotificationsSettingsResponse> = mono {
        val chatParticipants = chatParticipationRepository.findByChatId(chat.id)
                .collectList()
                .awaitFirst()

        var otherUser = chatParticipants
                .map { chatParticipation ->  chatParticipation.user }
                .find { user -> user.id != currentUserId }

        if (otherUser == null) {
            otherUser = chatParticipants[0].user
        }

        val chatResponse = chatMapper.toChatResponse(
                chat = chat,
                user = otherUser
        )

        return@mono ChatNotificationsSettingsResponse(
                chat = chatResponse,
                notificationsSettings = NotificationsSettingsResponse(
                        level = notificationsSettings.level,
                        sound = notificationsSettings.sound
                )
        )
    }

    private fun toChatNotificationsSettingsResponseForGroupChat(
            notificationsSettings: NotificationsSettings,
            chat: Chat
    ): Mono<ChatNotificationsSettingsResponse> = mono {
        val chatResponse = chatMapper.toChatResponse(chat)
        val usersIds = notificationsSettings.userExceptions?.keys?.toList() ?: listOf()

        if (usersIds.isEmpty()) {
            return@mono ChatNotificationsSettingsResponse(
                    chat = chatResponse,
                    notificationsSettings = NotificationsSettingsResponse(
                            level = notificationsSettings.level,
                            sound = notificationsSettings.sound
                    )
            )
        } else {
            val usersMap = userCacheWrapper.findByIds(usersIds)
                    .collectList()
                    .awaitFirst()
                    .associateBy { user -> user.id }

            return@mono ChatNotificationsSettingsResponse(
                    chat = chatResponse,
                    notificationsSettings = NotificationsSettingsResponse(
                            level = notificationsSettings.level,
                            sound = notificationsSettings.sound,
                    ),
                    userExceptions = usersIds.map { userId ->
                        val user = usersMap[userId]!!
                        val userNotificationsSettings = notificationsSettings.userExceptions!![userId]!!

                        return@map UserNotificationsSettingsResponse(
                                user = userMapper.toUserResponse(user),
                                notificationsSettings = NotificationsSettingsResponse(
                                        level = userNotificationsSettings.level,
                                        sound = userNotificationsSettings.sound
                                )
                        )
                    }
            )
        }
    }
}