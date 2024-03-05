package chatox.chat.service

import chatox.chat.model.EmojiInfo
import reactor.core.publisher.Mono

interface EmojiParserService {
    fun parseEmoji(text: String, emojiSet: String = "apple"): Mono<EmojiInfo>
}
