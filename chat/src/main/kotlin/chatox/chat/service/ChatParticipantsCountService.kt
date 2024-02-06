package chatox.chat.service

import chatox.chat.model.ChatParticipantsCount
import chatox.platform.pagination.PaginationRequest
import reactor.core.publisher.Mono

interface ChatParticipantsCountService {
    fun getChatParticipantsCount(chatId: String): Mono<ChatParticipantsCount>
    fun getChatParticipantsCount(chatIds: List<String>): Mono<Map<String, ChatParticipantsCount>>
    fun getPopularChatsParticipantsCount(paginationRequest: PaginationRequest): Mono<Map<String,ChatParticipantsCount>>
    fun increaseChatParticipantsCount(chatId: String): Mono<ChatParticipantsCount>
    fun increaseChatParticipantsCount(chatId: String, number: Int): Mono<ChatParticipantsCount>
    fun decreaseChatParticipantsCount(chatId: String): Mono<ChatParticipantsCount>
    fun decreaseChatParticipantsCount(chatId: String, number: Int): Mono<ChatParticipantsCount>
    fun increaseOnlineParticipantsCount(chatId: String): Mono<ChatParticipantsCount>
    fun increaseOnlineParticipantsCount(chatId: String, number: Int): Mono<ChatParticipantsCount>
    fun decreaseOnlineParticipantsCount(chatId: String): Mono<ChatParticipantsCount>
    fun decreaseOnlineParticipantsCount(chatId: String, number: Int): Mono<ChatParticipantsCount>
    fun initializeForChat(chatId: String, participantsCount: Int, onlineParticipantsCount: Int): Mono<ChatParticipantsCount>
    fun setHideFromSearch(chatId: String, hideFromSearch: Boolean): Mono<ChatParticipantsCount>
}