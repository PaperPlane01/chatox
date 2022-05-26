package chatox.chat.repository.mongodb.custom

import chatox.chat.model.Chat
import reactor.core.publisher.Mono

interface ChatMessagesCounterCustomRepository {
    fun getNextCounterValue(chat: Chat): Mono<Long>
    fun getNextCounterValue(chatId: String): Mono<Long>
}
