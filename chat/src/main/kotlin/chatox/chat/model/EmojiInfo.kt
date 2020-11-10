package chatox.chat.model

data class EmojiInfo(
        var emojiPositions: List<EmojiPosition> = arrayListOf(),
        var emoji: Map<String, EmojiData> = HashMap()
)
