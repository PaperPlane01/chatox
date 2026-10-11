package chatox.platform.text.api.request

import lombok.Builder

@Builder
data class ParseTextRequest(
    val text: String,
    val emojiSet: String,
    val parseColons: Boolean
)
