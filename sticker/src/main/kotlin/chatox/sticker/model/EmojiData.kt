package chatox.sticker.model

data class EmojiData(
        val id: String,
        val name: String,
        val short_names: List<String>,
        val colons: String,
        val emoticons: List<String>,
        val unified: String,
        val skin: String?,
        val native: String,
        val originalSet: String = "apple"
)
