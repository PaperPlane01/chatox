package chatox.chat.repository.custom

import chatox.chat.model.Chat
import reactor.core.publisher.Mono

interface ChatCustomRepository {
    fun increaseNumberOfParticipants(chatId: String): Mono<Chat>
    fun decreaseNumberOfParticipants(chatId: String): Mono<Chat>
    fun increaseNumberOfOnlineParticipants(chatId: String): Mono<Chat>
    fun decreaseNumberOfOnlineParticipants(chatId: String): Mono<Chat>
}
