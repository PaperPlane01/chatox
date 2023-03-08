package chatox.chat.model

data class SendMessagesFeatureAdditionalData(
        val allowedToSendStickers: Boolean = true,
        val allowedToSendImages: Boolean = true,
        val allowedToSendAudios: Boolean = true,
        val allowedToSendVideos: Boolean = true,
        val allowedToSendFiles: Boolean = true,
        val allowedToSendVoiceMessages: Boolean = true
)
