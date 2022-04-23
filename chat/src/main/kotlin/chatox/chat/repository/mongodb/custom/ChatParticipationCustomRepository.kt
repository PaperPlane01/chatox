package chatox.chat.repository.mongodb.custom

import chatox.chat.model.User
import com.mongodb.client.result.UpdateResult
import reactor.core.publisher.Mono

interface ChatParticipationCustomRepository {
    fun updateChatParticipationsOfUser(user: User): Mono<UpdateResult>
    fun updateChatDeleted(chatId: String, chatDeleted: Boolean): Mono<UpdateResult>
}
