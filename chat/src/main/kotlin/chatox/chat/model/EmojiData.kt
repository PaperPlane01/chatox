package chatox.chat.model

data class EmojiData(
      var id: String,
      var name: String,
      var short_names: List<String>,
      var colons: String,
      var emoticons: List<String>,
      var unified: String,
      var skin: String?,
      var native: String,
      var originalSet: String
)
