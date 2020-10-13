package chatox.chat.repository

import chatox.chat.model.ChatMessagesCounter
import chatox.chat.repository.custom.ChatMessagesCounterCustomRepository
import org.springframework.data.mongodb.repository.ReactiveMongoRepository

interface ChatMessagesCounterRepository : ReactiveMongoRepository<ChatMessagesCounter, String>,
        ChatMessagesCounterCustomRepository
