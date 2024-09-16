package chatox.chat.model

data class TextInfo(
        val emoji: EmojiInfo = EmojiInfo(),
        val userLinks: UserLinksInfo = UserLinksInfo()
)
