package chatox.platform.text.api.response

import lombok.Builder

@Builder
data class TextInfo(
    val emoji: EmojiInfo = EmojiInfo(),
    val userLinks: UserLinksInfo = UserLinksInfo()
)
