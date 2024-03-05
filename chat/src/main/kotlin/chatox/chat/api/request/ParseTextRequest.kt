package chatox.chat.api.request

data class ParseTextRequest(
        val text: String,
        val emojiSet: String,
        val parseColons: Boolean
)
