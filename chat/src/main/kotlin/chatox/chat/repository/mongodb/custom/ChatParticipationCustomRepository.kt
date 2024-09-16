package chatox.chat.repository.mongodb.custom

import chatox.chat.model.ChatParticipation
import chatox.chat.model.User
import com.mongodb.client.result.UpdateResult
import org.springframework.data.domain.Pageable
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatParticipationCustomRepository {
    fun updateChatParticipationsOfUser(user: User): Mono<UpdateResult>
    fun updateChatDeleted(chatId: String, chatDeleted: Boolean): Mono<UpdateResult>
    fun searchChatParticipants(chatId: String, searchQuery: String, pageable: Pageable): Flux<ChatParticipation>
    fun findByChatIdAndUserIdOrSlugIn(chatId: String, userIdsOrSlugs: List<String>, includeDeleted: Boolean = false, excludedUsersIds: List<String> = listOf()): Flux<ChatParticipation>
    fun findWithCustomNotificationsSettings(userId: String): Flux<ChatParticipation>
}
