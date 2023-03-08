package chatox.chat.model

data class ChatBlockingFeatureData(
        override val enabled: Boolean = false,
        override val additional: ChatBlockingFeatureAdditionalData = ChatBlockingFeatureAdditionalData(allowPermanent = false)
) : ChatFeatureData<ChatBlockingFeatureAdditionalData>