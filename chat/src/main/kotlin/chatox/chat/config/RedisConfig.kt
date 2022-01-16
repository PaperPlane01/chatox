package chatox.chat.config

import chatox.chat.model.Chat
import chatox.chat.model.ChatBlocking
import chatox.chat.model.Message
import chatox.chat.model.Upload
import chatox.chat.model.User
import chatox.chat.model.UserBlacklistItem
import chatox.platform.cache.CacheKeyGenerator
import chatox.platform.cache.DefaultCacheKeyGenerator
import chatox.platform.cache.redis.RedisReactiveCacheService
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.connection.ReactiveRedisConnectionFactory
import org.springframework.data.redis.core.ReactiveRedisTemplate
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer
import org.springframework.data.redis.serializer.RedisSerializationContext
import org.springframework.data.redis.serializer.StringRedisSerializer
import kotlin.reflect.KClass

@Configuration
class RedisConfig {
    @Autowired
    private lateinit var connectionFactory: ReactiveRedisConnectionFactory

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Value("\${spring.application.name}")
    private lateinit var applicationName: String

    @Bean
    fun chatCacheService() = RedisReactiveCacheService<Chat>(
            chatRedisTemplate(),
            cacheKeyGenerator(),
            Chat::class.java
    ) { chat -> chat.id }

    @Bean
    fun userCacheService() = RedisReactiveCacheService<User>(
            userRedisTemplate(),
            cacheKeyGenerator(),
            User::class.java
    ) { user -> user.id }

    @Bean
    fun chatBlockingCacheService() = RedisReactiveCacheService<ChatBlocking>(
            chatBlockingRedisTemplate(),
            cacheKeyGenerator(),
            ChatBlocking::class.java
    ) { chatBlocking -> chatBlocking.id }

    @Bean
    fun messageCacheService() = RedisReactiveCacheService<Message>(
            messageRedisTemplate(),
            cacheKeyGenerator(),
            Message::class.java
    ) { message -> message.id }

    @Bean
    fun userBlackListItemCacheService() = RedisReactiveCacheService<UserBlacklistItem>(
            userBlacklistItemRedisTemplate(),
            cacheKeyGenerator(),
            UserBlacklistItem::class.java
    ) { userBlacklistItem -> "${userBlacklistItem.userId}_${userBlacklistItem.blacklistedById}" }

    @Bean
    fun cacheKeyGenerator() = DefaultCacheKeyGenerator(applicationName, CacheKeyGenerator.ClassKeyMode.SIMPLE)

    @Bean
    fun userRedisTemplate() = createRedisTemplate(User::class)

    @Bean
    fun chatRedisTemplate() = createRedisTemplate(Chat::class)

    @Bean
    fun chatBlockingRedisTemplate() = createRedisTemplate(ChatBlocking::class)

    @Bean
    fun messageRedisTemplate() = createRedisTemplate(Message::class)

    @Bean
    fun uploadRedisTemplate() = createRedisTemplate(Upload::class)

    @Bean
    fun userBlacklistItemRedisTemplate() = createRedisTemplate(UserBlacklistItem::class)

    private fun <T: Any> createRedisTemplate(clazz: KClass<T>): ReactiveRedisTemplate<String, T> {
        val stringRedisSerializer = StringRedisSerializer()
        val jackson2JsonRedisSerializer = Jackson2JsonRedisSerializer<T>(clazz.java)
        jackson2JsonRedisSerializer.setObjectMapper(objectMapper)
        val redisSerializationContext = RedisSerializationContext.newSerializationContext<String, T>(stringRedisSerializer)
                .value(jackson2JsonRedisSerializer)
                .build()

        return ReactiveRedisTemplate(connectionFactory, redisSerializationContext)
    }
}
