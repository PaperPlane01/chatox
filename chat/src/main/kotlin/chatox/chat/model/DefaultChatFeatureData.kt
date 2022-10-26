package chatox.chat.model

data class DefaultChatFeatureData(
        override val enabled: Boolean = false,
        override val additional: EmptyFeatureData = EmptyFeatureData()
) : ChatFeatureData<EmptyFeatureData>
