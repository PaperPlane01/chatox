package chatox.chat.repository.mongodb.custom

import chatox.chat.model.ChatParticipantsCount
import reactor.core.publisher.Mono

interface ChatParticipantsCountCustomRepository {
    fun increaseParticipantsCount(chatId: String): Mono<ChatParticipantsCount>
    fun increaseParticipantsCount(chatId: String, number: Int): Mono<ChatParticipantsCount>
    fun decreaseParticipantsCount(chatId: String): Mono<ChatParticipantsCount>
    fun decreaseParticipantsCount(chatId: String, number: Int): Mono<ChatParticipantsCount>
    fun increaseOnlineParticipantsCount(chatId: String): Mono<ChatParticipantsCount>
    fun increaseOnlineParticipantsCount(chatId: String, number: Int): Mono<ChatParticipantsCount>
    fun decreaseOnlineParticipantsCount(chatId: String): Mono<ChatParticipantsCount>
    fun decreaseOnlineParticipantsCount(chatId: String, number: Int): Mono<ChatParticipantsCount>
}