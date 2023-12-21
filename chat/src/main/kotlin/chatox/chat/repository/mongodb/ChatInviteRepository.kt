package chatox.chat.repository.mongodb

import chatox.chat.model.ChatInvite
import chatox.chat.repository.mongodb.custom.ChatInviteCustomRepository
import org.springframework.data.mongodb.repository.ReactiveMongoRepository

interface ChatInviteRepository : ReactiveMongoRepository<ChatInvite, String>, ChatInviteCustomRepository {
}