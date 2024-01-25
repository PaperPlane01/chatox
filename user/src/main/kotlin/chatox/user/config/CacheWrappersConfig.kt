package chatox.user.config

import chatox.platform.cache.DefaultReactiveRepositoryCacheWrapper
import chatox.platform.cache.ReactiveCacheService
import chatox.user.domain.User
import chatox.user.domain.UserInteractionCost
import chatox.user.domain.UserInteractionType
import chatox.user.repository.UserInteractionCostRepository
import chatox.user.repository.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class CacheWrappersConfig {
    @Autowired
    private lateinit var userInteractionCostRepository: UserInteractionCostRepository

    @Autowired
    private lateinit var userInteractionCacheService: ReactiveCacheService<UserInteractionCost, String>

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    @Qualifier(RedisConfig.USER_BY_ID_CACHE)
    private lateinit var userCacheService: ReactiveCacheService<User, String>

    @Bean
    fun userInteractionCostCacheWrapper() = DefaultReactiveRepositoryCacheWrapper(
            userInteractionCacheService,
            userInteractionCostRepository,
            { userInteractionCostRepository, type -> userInteractionCostRepository.findByType(UserInteractionType.valueOf(type)) },
            { userInteractionCost -> userInteractionCost.type.name }
    )

    @Bean
    fun userCacheWrapper() = DefaultReactiveRepositoryCacheWrapper(
            userCacheService,
            userRepository
    )
}