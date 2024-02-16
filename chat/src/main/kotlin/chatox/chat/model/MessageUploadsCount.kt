package chatox.chat.model

data class MessageUploadsCount(
        val images: Int = 0,
        val videos: Int = 0,
        val audios: Int = 0,
        val voiceMessages: Int = 0,
        val files: Int = 0
)