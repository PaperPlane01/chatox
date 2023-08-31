package chatox.user.config

import chatox.platform.cache.CacheKeyGenerator
import chatox.platform.cache.DefaultCacheKeyGenerator
import chatox.platform.cache.redis.RedisReactiveCacheService
import chatox.user.domain.User
import chatox.user.domain.UserInteractionCost
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

    @Bean(name = [USER_BY_ID_CACHE])
    fun userByIdCacheService() = RedisReactiveCacheService(
            userRedisTemplate(),
            cacheKeyGenerator(),
            User::class.java
    ) { user -> user.id }

    @Bean(name = [USER_BY_SLUG_CACHE])
    fun userBySlugCache() = RedisReactiveCacheService(
            userRedisTemplate(),
            cacheKeyGenerator(),
            User::class.java
    ) { user -> user.slug }

    @Bean
    fun userInteractionCostCache() = RedisReactiveCacheService(
            userInteractionCostRedisTemplate(),
            cacheKeyGenerator(),
            UserInteractionCost::class.java
    ) { userInteractionCost -> userInteractionCost.type.name }

    @Bean
    fun userRedisTemplate() = createRedisTemplate(User::class)

    @Bean
    fun userInteractionCostRedisTemplate() = createRedisTemplate(UserInteractionCost::class)

    @Bean
    fun cacheKeyGenerator() = DefaultCacheKeyGenerator(applicationName, CacheKeyGenerator.ClassKeyMode.SIMPLE)

    private fun <T: Any> createRedisTemplate(clazz: KClass<T>): ReactiveRedisTemplate<String, T> {
        val stringRedisSerializer = StringRedisSerializer()
        val jackson2JsonRedisSerializer = Jackson2JsonRedisSerializer(objectMapper, clazz.java)
        val redisSerializationContext = RedisSerializationContext.newSerializationContext<String, T>(stringRedisSerializer)
                .value(jackson2JsonRedisSerializer)
                .build()

        return ReactiveRedisTemplate(connectionFactory, redisSerializationContext)
    }

    companion object {
        const val USER_BY_ID_CACHE = "USER_BY_ID_CACHE"
        const val USER_BY_SLUG_CACHE = "USER_BY_SLUG_CACHE"
    }
}
