package chatox.chat.model

data class AudioUploadMetadata(
        val duration: Double,
        val bitrate: Int,
        val waveForm: List<Double>? = null
)
