package chatox.platform.text.api.response

import lombok.Builder

@Builder
data class EmojiPosition(
    val start: Int,
    val end: Int,
    val emojiId: String
)
