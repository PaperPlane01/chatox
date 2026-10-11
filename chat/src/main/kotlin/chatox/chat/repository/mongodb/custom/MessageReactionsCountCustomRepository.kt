package chatox.chat.repository.mongodb.custom

import chatox.chat.model.MessageReactionsCount
import chatox.platform.text.api.response.EmojiData
import reactor.core.publisher.Mono

interface MessageReactionsCountCustomRepository {
    fun incrementReactionsCount(messageId: String, emojiData: EmojiData): Mono<MessageReactionsCount>
    fun decrementReactionsCount(messageId: String, emojiData: EmojiData): Mono<MessageReactionsCount>
}