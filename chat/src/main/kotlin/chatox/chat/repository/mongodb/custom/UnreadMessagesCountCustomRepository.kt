package chatox.chat.repository.mongodb.custom

import chatox.chat.model.Message
import reactor.core.publisher.Mono

interface UnreadMessagesCountCustomRepository {
    fun increaseUnreadMessagesCountForChat(chatId: String, increaseCount: Long = 1, excludedChatParticipations: List<String> = listOf()): Mono<Unit>
    fun decreaseUnreadMessagesCount(chatParticipationId: String, lastReadMessage: Message, decreaseUnreadMentionsCount: Boolean = false): Mono<Unit>
    fun resetUnreadMessagesCount(chatParticipationId: String, lastReadMessage: Message): Mono<Unit>
    fun increaseUnreadMentionsCount(chatParticipations: List<String>): Mono<Unit>
}