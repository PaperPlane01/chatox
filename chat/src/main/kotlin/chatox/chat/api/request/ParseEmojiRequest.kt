package chatox.chat.api.request

data class ParseEmojiRequest(
        val text: String,
        val emojiSet: String
)
