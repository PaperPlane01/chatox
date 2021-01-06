package chatox.chat.config

import chatox.chat.model.Chat
import chatox.chat.model.ChatBlocking
import chatox.chat.model.Message
import chatox.chat.model.User
import chatox.chat.repository.ChatBlockingRepository
import chatox.chat.repository.ChatRepository
import chatox.chat.repository.MessageRepository
import chatox.chat.repository.UserRepository
import chatox.platform.cache.ReactiveCacheService
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class CacheWrappersConfig {
    @Autowired
    private lateinit var chatRepository: ChatRepository

    @Autowired
    private lateinit var chatCacheService: ReactiveCacheService<Chat, String>

    @Autowired
    private lateinit var chatBlockingRepository: ChatBlockingRepository

    @Autowired
    private lateinit var chatBlockingCacheService: ReactiveCacheService<ChatBlocking, String>

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var userCacheService: ReactiveCacheService<User, String>

    @Autowired
    private lateinit var messageRepository: MessageRepository

    @Autowired
    private lateinit var messageCacheService: ReactiveCacheService<Message, String>

    @Bean
    fun chatCacheWrapper() = ReactiveRepositoryCacheWrapper(chatCacheService, chatRepository)

    @Bean
    fun chatBlockingCacheWrapper() = ReactiveRepositoryCacheWrapper(chatBlockingCacheService, chatBlockingRepository)

    @Bean
    fun userCacheWrapper() = ReactiveRepositoryCacheWrapper(userCacheService, userRepository)

    @Bean
    fun messageCacheWrapper() = ReactiveRepositoryCacheWrapper(messageCacheService, messageRepository)
}
