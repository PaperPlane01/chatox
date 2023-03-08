package chatox.chat.config

import chatox.chat.model.Chat
import chatox.chat.model.ChatBlocking
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatRole
import chatox.chat.model.Message
import chatox.chat.model.User
import chatox.chat.model.UserBlacklistItem
import chatox.chat.repository.mongodb.ChatBlockingMongoRepository
import chatox.chat.repository.mongodb.ChatParticipationRepository
import chatox.chat.repository.mongodb.ChatRepository
import chatox.chat.repository.mongodb.ChatRoleRepository
import chatox.chat.repository.mongodb.MessageMongoRepository
import chatox.chat.repository.mongodb.UserBlacklistItemRepository
import chatox.chat.repository.mongodb.UserRepository
import chatox.platform.cache.ReactiveCacheService
import chatox.platform.cache.DefaultReactiveRepositoryCacheWrapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import reactor.core.publisher.Mono

@Configuration
class CacheWrappersConfig {
    @Autowired
    private lateinit var chatRepository: ChatRepository

    @Autowired
    @Qualifier(RedisConfig.CHAT_BY_ID_CACHE_SERVICE)
    private lateinit var chatByIdCacheService: ReactiveCacheService<Chat, String>

    @Autowired
    @Qualifier(RedisConfig.CHAT_BY_SLUG_CACHE_SERVICE)
    private lateinit var chatBySlugCacheService: ReactiveCacheService<Chat, String>

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

    @Autowired
    private lateinit var chatRoleRepository: ChatRoleRepository

    @Autowired
    private lateinit var chatRoleCacheService: ReactiveCacheService<ChatRole, String>

    @Autowired
    private lateinit var chatParticipationRepository: ChatParticipationRepository

    @Autowired
    private lateinit var chatParticipationCacheService: ReactiveCacheService<ChatParticipation, String>

    @Bean
    @Qualifier(CHAT_BY_ID_CACHE_WRAPPER)
    fun chatByIdCacheWrapper() = DefaultReactiveRepositoryCacheWrapper(chatByIdCacheService, chatRepository)

    @Bean
    @Qualifier(CHAT_BY_SLUG_CACHE_WRAPPER)
    fun chatBySlugCacheWrapper() = DefaultReactiveRepositoryCacheWrapper(
            chatBySlugCacheService,
            chatRepository,
            ::findChat
    )

    private fun findChat(chatRepository: ChatRepository, id: String): Mono<Chat> {
        return chatRepository.findByIdEqualsOrSlugEquals(id, id)
    }

    @Bean
    fun chatBlockingCacheWrapper() = DefaultReactiveRepositoryCacheWrapper(chatBlockingCacheService, chatBlockingRepository)

    @Bean
    fun userCacheWrapper() = DefaultReactiveRepositoryCacheWrapper(userCacheService, userRepository)

    @Bean
    fun messageCacheWrapper() = DefaultReactiveRepositoryCacheWrapper(messageCacheService, messageRepository)

    @Bean
    fun userBlacklistItemCacheWrapper() = DefaultReactiveRepositoryCacheWrapper(userBlacklistItemCacheService, userBlacklistItemRepository)

    @Bean
    @Qualifier(CHAT_ROLE_CACHE_WRAPPER)
    fun chatRoleCacheWrapper() = DefaultReactiveRepositoryCacheWrapper(chatRoleCacheService, chatRoleRepository)

    @Bean
    fun chatParticipationCacheWrapper() = DefaultReactiveRepositoryCacheWrapper(chatParticipationCacheService, chatParticipationRepository)

    companion object {
        const val CHAT_ROLE_CACHE_WRAPPER = "chatRoleCacheWrapper"
        const val DEFAULT_ROLE_OF_CHAT_CACHE_WRAPPER = "defaultRoleOfChatCacheWrapper"
        const val CHAT_BY_ID_CACHE_WRAPPER = "chatByIdCacheWrapper"
        const val CHAT_BY_SLUG_CACHE_WRAPPER = "chatBySlugCacheWrapper"
    }
}
