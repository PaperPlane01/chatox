package chatox.chat.repository.mongodb.custom

import chatox.chat.model.Chat
import reactor.core.publisher.Mono

interface ChatCustomRepository {
    fun increaseNumberOfParticipants(chatId: String): Mono<Chat>
    fun increaseNumberOfParticipants(chatId: String, number: Int): Mono<Chat>
    fun decreaseNumberOfParticipants(chatId: String): Mono<Chat>
    fun increaseNumberOfOnlineParticipants(chatId: String): Mono<Chat>
    fun decreaseNumberOfOnlineParticipants(chatId: String): Mono<Chat>
}
