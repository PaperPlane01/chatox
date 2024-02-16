package chatox.chat.model

import com.fasterxml.jackson.annotation.JsonIgnore

data class ChatFeatures(
        val sendMessages: SendMessagesFeatureData = SendMessagesFeatureData(
                enabled = true,
                additional = SendMessagesFeatureAdditionalData(
                        allowedToSendAudios = true,
                        allowedToSendFiles = true,
                        allowedToSendImages = true,
                        allowedToSendStickers = true,
                        allowedToSendVideos = true,
                        allowedToSendVoiceMessages = true
                )
        ),
        val blockUsers: ChatBlockingFeatureData = ChatBlockingFeatureData(
                enabled = false
        ),
        val kickUsers: DefaultChatFeatureData = DefaultChatFeatureData(enabled = false),
        val deleteOwnMessages: DefaultChatFeatureData = DefaultChatFeatureData(enabled = true),
        val deleteOtherUsersMessages: LevelBasedFeatureData = LevelBasedFeatureData(enabled = false),
        val scheduleMessages: DefaultChatFeatureData = DefaultChatFeatureData(enabled = false),
        val deleteChat: DefaultChatFeatureData = DefaultChatFeatureData(enabled = false),
        val changeChatSettings: DefaultChatFeatureData = DefaultChatFeatureData(enabled = false),
        val modifyChatRoles: LevelBasedFeatureData = LevelBasedFeatureData(enabled = false),
        val assignChatRole: LevelBasedFeatureData = LevelBasedFeatureData(enabled = false),
        val kickImmunity: DefaultChatFeatureData = DefaultChatFeatureData(enabled = false),
        val blockingImmunity: LevelBasedFeatureData = LevelBasedFeatureData(enabled = false),
        val messageDeletionsImmunity: LevelBasedFeatureData = LevelBasedFeatureData(enabled = false),
        val showRoleNameInMessages: DefaultChatFeatureData = DefaultChatFeatureData(enabled = false),
        val pinMessages: DefaultChatFeatureData = DefaultChatFeatureData(enabled = false),
        val manageInvites: DefaultChatFeatureData = DefaultChatFeatureData(enabled = false),
        val approveJoinChatRequests: DefaultChatFeatureData = DefaultChatFeatureData(enabled = false)
) {
    @get:JsonIgnore
    val enabled: List<ChatFeatureData<*>>
        get() =  asList().filter { it.enabled }

    private fun asList() = listOf(
            sendMessages,
            blockUsers,
            kickUsers,
            deleteOwnMessages,
            deleteOtherUsersMessages,
            scheduleMessages,
            deleteChat,
            changeChatSettings,
            modifyChatRoles,
            assignChatRole,
            kickImmunity,
            blockingImmunity,
            messageDeletionsImmunity,
            showRoleNameInMessages,
            pinMessages,
            manageInvites,
            approveJoinChatRequests
    )
}
