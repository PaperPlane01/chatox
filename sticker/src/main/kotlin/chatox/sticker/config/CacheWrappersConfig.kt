package chatox.sticker.config

import chatox.platform.cache.DefaultReactiveRepositoryCacheWrapper
import chatox.platform.cache.redis.RedisReactiveCacheService
import chatox.sticker.model.StickerPack
import chatox.sticker.repository.StickerPackRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class CacheWrappersConfig {
    @Autowired
    private lateinit var stickerPackRepository: StickerPackRepository

    @Autowired
    private lateinit var stickerPackCacheService: RedisReactiveCacheService<StickerPack<*>>

    @Bean
    fun stickerPackCacheWrapper() = DefaultReactiveRepositoryCacheWrapper(
            stickerPackCacheService,
            stickerPackRepository
    ) { stickerPack -> stickerPack.id }
}