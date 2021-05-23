package chatox.user.cache

import chatox.platform.cache.ReactiveCacheService
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.user.config.RedisConfig
import chatox.user.domain.User
import chatox.user.repository.UserRepository
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class UserReactiveRepositoryCacheWrapper(
        @Autowired
        @Qualifier(RedisConfig.USER_BY_ID_CACHE)
        private val userByIdCache: ReactiveCacheService<User, String>,

        @Autowired
        @Qualifier(RedisConfig.USER_BY_SLUG_CACHE)
        private val userBySlugCache: ReactiveCacheService<User, String>,

        @Autowired
        private val userRepository: UserRepository
) : ReactiveRepositoryCacheWrapper<User, String>(userByIdCache, userRepository) {

    fun findBySlug(slug: String, putInCacheIfAbsent: Boolean): Mono<User> {
        return mono {
            var user = userBySlugCache.find(slug).awaitFirstOrNull()

            if (user == null) {
               user = userRepository.findBySlug(slug).awaitFirstOrNull()

                if (putInCacheIfAbsent) {
                    userBySlugCache.put(user).awaitFirst()
                }
            }

            user
        }
    }
}
