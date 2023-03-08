package chatox.chat.repository.mongodb

import chatox.chat.model.ChatDeletion
import org.springframework.data.mongodb.repository.ReactiveMongoRepository

interface ChatDeletionRepository : ReactiveMongoRepository<ChatDeletion, String>
