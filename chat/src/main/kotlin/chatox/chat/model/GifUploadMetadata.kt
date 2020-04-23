package chatox.chat.model

data class GifUploadMetadata(
        val width: Int,
        val height: Int,
        val duration: Int,
        val durationIE: Int,
        val durationOpera: Int,
        val durationFirefox: Int,
        val durationChrome: Int,
        val durationSafari: Int,
        val animated: Boolean,
        val infinite: Boolean,
        val loopCount: Int
)
