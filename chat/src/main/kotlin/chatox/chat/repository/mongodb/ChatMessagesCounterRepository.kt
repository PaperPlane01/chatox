package chatox.chat.repository.mongodb

import chatox.chat.model.ChatMessagesCounter
import chatox.chat.repository.mongodb.custom.ChatMessagesCounterCustomRepository
import org.springframework.data.mongodb.repository.ReactiveMongoRepository

interface ChatMessagesCounterRepository : ReactiveMongoRepository<ChatMessagesCounter, String>,
        ChatMessagesCounterCustomRepository
