package chatox.chat.api.response

import chatox.platform.text.api.response.EmojiData

data class MessageReactionsCountResponse(
    val emoji: EmojiData,
    val count: Long,
    val lastReactions: List<MessageReactionResponse>,
    val reactedByCurrentUser: Boolean,
    val currentUserReaction: MessageReactionResponse? = null,
)
