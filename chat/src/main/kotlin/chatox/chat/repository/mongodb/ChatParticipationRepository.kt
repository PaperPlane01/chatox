package chatox.chat.repository.mongodb

import chatox.chat.model.ChatParticipation
import chatox.chat.model.User
import chatox.chat.repository.mongodb.custom.ChatParticipationCustomRepository
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatParticipationRepository : ReactiveMongoRepository<ChatParticipation, String>,
        ChatParticipationCustomRepository {
    fun save(chatParticipation: ChatParticipation): Mono<ChatParticipation>
    override fun findById(id: String): Mono<ChatParticipation>
    fun findByIdAndDeletedFalse(id: String): Mono<ChatParticipation>
    fun findAllByUserIdAndDeletedFalse(userId: String): Flux<ChatParticipation>
    fun findByChatIdAndDeletedFalse(chatId: String): Flux<ChatParticipation>
    fun findByChatIdAndUserId(chatId: String, userId: String): Mono<ChatParticipation>
    fun findByChatId(chatId: String): Flux<ChatParticipation>
    fun findByChatIdAndUserIdAndDeletedFalse(chatId: String, userId: String): Mono<ChatParticipation>
    fun findByChatIdAndUserIdAndDeletedTrue(chatId: String, userId: String): Mono<ChatParticipation>
    fun findByChatIdAndUserOnlineTrue(chatId: String): Flux<ChatParticipation>
    fun findByIdAndChatId(id: String, chatId: String): Mono<ChatParticipation>
    fun findByChatIdAndRoleIdAndDeletedFalse(chatId: String, roleId: String, pageable: Pageable): Flux<ChatParticipation>
    fun findByChatIdAndUserIdInAndDeletedFalse(chatId: String, userIds: List<String>): Flux<ChatParticipation>
    fun findByChatIdInAndUserId(chatIds: Collection<String>, userId: String): Flux<ChatParticipation>
    fun existsByChatIdAndUserIdAndDeletedFalse(chatId: String, userId: String): Mono<Boolean>
    fun findByChatIdAndInviteIdAndDeletedFalse(chatId: String, inviteId: String, pageable: Pageable): Flux<ChatParticipation>
}
