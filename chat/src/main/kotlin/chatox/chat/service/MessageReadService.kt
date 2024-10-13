package chatox.chat.service

import chatox.chat.model.ChatParticipation
import chatox.chat.model.Message
import chatox.chat.model.UnreadMessagesCount
import reactor.core.publisher.Mono

interface MessageReadService {
    fun groupUnreadMessagesCountByChats(chatParticipationsIds: List<String>): Mono<Map<String, UnreadMessagesCount>>
    fun increaseUnreadMessagesCountForChat(chatId: String, excludedChatParticipations: List<String> = listOf()): Mono<Unit>
    fun increaseUnreadMessagesCountForChat(chatId: String, increaseCount: Long = 1, excludedChatParticipations: List<String> = listOf()): Mono<Unit>
    fun increaseUnreadMentionsCount(chatParticipationsIds: List<String>): Mono<Unit>
    fun decreaseUnreadMentionsCount(chatParticipationsIds: List<String>): Mono<Unit>
    fun readMessageForCurrentUser(chatId: String, messageId: String): Mono<Unit>
    fun readAllMessagesForCurrentUser(chatId: String): Mono<Unit>
    fun readAllMessagesForCurrentUser(chatParticipation: ChatParticipation, lastMessage: Message): Mono<Unit>
    fun initializeUnreadMessagesCount(chatParticipation: ChatParticipation): Mono<UnreadMessagesCount>
    fun initializeUnreadMessagesCount(chatParticipation: ChatParticipation, lastMessageId: String?): Mono<UnreadMessagesCount>
    fun initializeUnreadMessagesCount(chatParticipation: ChatParticipation, lastMessage: Message?): Mono<UnreadMessagesCount>
}