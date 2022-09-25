package chatox.chat.config

import chatox.chat.model.Chat
import chatox.chat.model.ChatBlocking
import chatox.chat.model.ChatParticipation
import chatox.chat.model.ChatRole
import chatox.chat.model.Message
import chatox.chat.model.Upload
import chatox.chat.model.User
import chatox.chat.model.UserBlacklistItem
import chatox.chat.util.generateBlacklistItemCacheId
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
    fun chatCacheService() = RedisReactiveCacheService(
            chatRedisTemplate(),
            cacheKeyGenerator(),
            Chat::class.java
    ) { chat -> chat.id }

    @Bean
    fun userCacheService() = RedisReactiveCacheService(
            userRedisTemplate(),
            cacheKeyGenerator(),
            User::class.java
    ) { user -> user.id }

    @Bean
    fun chatBlockingCacheService() = RedisReactiveCacheService(
            chatBlockingRedisTemplate(),
            cacheKeyGenerator(),
            ChatBlocking::class.java
    ) { chatBlocking -> chatBlocking.id }

    @Bean
    fun messageCacheService() = RedisReactiveCacheService(
            messageRedisTemplate(),
            cacheKeyGenerator(),
            Message::class.java
    ) { message -> message.id }

    @Bean
    fun userBlackListItemCacheService() = RedisReactiveCacheService(
            userBlacklistItemRedisTemplate(),
            cacheKeyGenerator(),
            UserBlacklistItem::class.java,
            ::generateBlacklistItemCacheId
    )

    @Bean
    fun chatRoleCacheService() = RedisReactiveCacheService(
            chatRoleRedisTemplate(),
            cacheKeyGenerator(),
            ChatRole::class.java
    ) { chatRole -> chatRole.id }

    @Bean
    fun defaultChatRoleCacheService() = RedisReactiveCacheService(
            chatRoleRedisTemplate(),
            cacheKeyGenerator(),
            ChatRole::class.java
    ) { chatRole -> chatRole.chatId }

    @Bean
    fun chatParticipationCacheService() = RedisReactiveCacheService(
            chatParticipationRedisTemplate(),
            cacheKeyGenerator(),
            ChatParticipation::class.java
    ) { chatParticipation -> chatParticipation.id }

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

    @Bean
    fun chatRoleRedisTemplate() = createRedisTemplate(ChatRole::class)

    @Bean
    fun chatParticipationRedisTemplate() = createRedisTemplate(ChatParticipation::class)

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
