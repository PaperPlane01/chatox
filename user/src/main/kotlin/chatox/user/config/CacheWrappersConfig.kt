package chatox.user.config

import chatox.platform.cache.DefaultReactiveRepositoryCacheWrapper
import chatox.platform.cache.ReactiveCacheService
import chatox.user.domain.UserInteractionCost
import chatox.user.domain.UserInteractionType
import chatox.user.repository.UserInteractionCostRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class CacheWrappersConfig {
    @Autowired
    private lateinit var userInteractionCostRepository: UserInteractionCostRepository

    @Autowired
    private lateinit var userInteractionCacheService: ReactiveCacheService<UserInteractionCost, String>

    @Bean
    fun userInteractionCostCacheWrapper() = DefaultReactiveRepositoryCacheWrapper(
            userInteractionCacheService,
            userInteractionCostRepository,
            { userInteractionCostRepository, type -> userInteractionCostRepository.findByType(UserInteractionType.valueOf(type)) },
            { userInteractionCost -> userInteractionCost.type.name }
    )
}