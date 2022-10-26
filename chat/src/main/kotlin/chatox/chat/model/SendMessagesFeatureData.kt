package chatox.chat.model

data class SendMessagesFeatureData(
        override val enabled: Boolean = true,
        override val additional: SendMessagesFeatureAdditionalData = SendMessagesFeatureAdditionalData()
) : ChatFeatureData<SendMessagesFeatureAdditionalData>
