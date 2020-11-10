package chatox.chat.repository.custom

import chatox.chat.model.User
import com.mongodb.client.result.UpdateResult
import reactor.core.publisher.Mono

interface ChatParticipationCustomRepository {
    fun updateDisplayedNameOfChatParticipationsByUser(user: User): Mono<UpdateResult>
    fun updateChatDeleted(chatId: String, chatDeleted: Boolean): Mono<UpdateResult>
}
