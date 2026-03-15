package chatox.chat.model

data class EmojiData(
    val id: String,
    val name: String,
    val colons: String,
    val emoticons: List<String>? = null,
    val unified: String,
    val native: String,
    val originalSet: String
)
