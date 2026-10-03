package chatox.chat.model

import chatox.platform.text.api.response.EmojiData

data class AddReactionsFeatureAdditionalData(
    val allowedEmojis: List<EmojiData> = listOf()
)
