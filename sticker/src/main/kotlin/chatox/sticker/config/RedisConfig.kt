package chatox.sticker.config

import chatox.platform.cache.CacheKeyGenerator
import chatox.platform.cache.DefaultCacheKeyGenerator
import chatox.platform.cache.redis.RedisReactiveCacheService
import chatox.sticker.model.StickerPack
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
    fun stickerPackReactiveCacheService() = RedisReactiveCacheService(
            stickerPackRedisTemplate(),
            cacheKeyGenerator(),
            StickerPack::class.java
    ) { stickerPack -> stickerPack.id }

    @Bean
    fun stickerPackRedisTemplate() = createRedisTemplate(StickerPack::class)

    private fun <T: Any> createRedisTemplate(clazz: KClass<T>): ReactiveRedisTemplate<String, T> {
        val stringRedisSerializer = StringRedisSerializer()
        val jackson2JsonRedisSerializer = Jackson2JsonRedisSerializer(objectMapper, clazz.java)
        val redisSerializationContext = RedisSerializationContext.newSerializationContext<String, T>(stringRedisSerializer)
                .value(jackson2JsonRedisSerializer)
                .build()

        return ReactiveRedisTemplate(connectionFactory, redisSerializationContext)
    }

    @Bean
    fun cacheKeyGenerator() = DefaultCacheKeyGenerator(applicationName, CacheKeyGenerator.ClassKeyMode.SIMPLE)
}