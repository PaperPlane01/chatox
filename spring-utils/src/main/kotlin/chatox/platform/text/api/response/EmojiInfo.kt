package chatox.platform.text.api.response

import lombok.Builder

@Builder
data class EmojiInfo(
    val emojiPositions: List<EmojiPosition> = arrayListOf(),
    val emoji: Map<String, EmojiData> = hashMapOf()
)
