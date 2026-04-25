package chatox.chat.service

import chatox.chat.model.TextInfo
import reactor.core.publisher.Mono

interface TextParserService {
    fun parseText(text: String, emojiSet: String = "apple"): Mono<TextInfo>
}
