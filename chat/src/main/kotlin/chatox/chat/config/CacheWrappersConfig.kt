package chatox.chat.config

import chatox.chat.model.Chat
import chatox.chat.model.ChatBlocking
import chatox.chat.model.Message
import chatox.chat.model.User
import chatox.chat.model.UserBlacklistItem
import chatox.chat.repository.mongodb.ChatBlockingMongoRepository
import chatox.chat.repository.mongodb.ChatRepository
import chatox.chat.repository.mongodb.MessageMongoRepository
import chatox.chat.repository.mongodb.UserBlacklistItemRepository
import chatox.chat.repository.mongodb.UserRepository
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
    private lateinit var chatBlockingRepository: ChatBlockingMongoRepository

    @Autowired
    private lateinit var chatBlockingCacheService: ReactiveCacheService<ChatBlocking, String>

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var userCacheService: ReactiveCacheService<User, String>

    @Autowired
    private lateinit var messageRepository: MessageMongoRepository

    @Autowired
    private lateinit var messageCacheService: ReactiveCacheService<Message, String>

    @Autowired
    private lateinit var userBlacklistItemRepository: UserBlacklistItemRepository

    @Autowired
    private lateinit var userBlacklistItemCacheService: ReactiveCacheService<UserBlacklistItem, String>

    @Bean
    fun chatCacheWrapper() = ReactiveRepositoryCacheWrapper(chatCacheService, chatRepository)

    @Bean
    fun chatBlockingCacheWrapper() = ReactiveRepositoryCacheWrapper(chatBlockingCacheService, chatBlockingRepository)

    @Bean
    fun userCacheWrapper() = ReactiveRepositoryCacheWrapper(userCacheService, userRepository)

    @Bean
    fun messageCacheWrapper() = ReactiveRepositoryCacheWrapper(messageCacheService, messageRepository)

    @Bean
    fun userBlacklistItemCacheWrapper() = ReactiveRepositoryCacheWrapper(userBlacklistItemCacheService, userBlacklistItemRepository)
}
