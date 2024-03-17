package chatox.chat.model

data class EmojiInfo(
        val emojiPositions: List<EmojiPosition> = arrayListOf(),
        val emoji: Map<String, EmojiData> = HashMap()
)
