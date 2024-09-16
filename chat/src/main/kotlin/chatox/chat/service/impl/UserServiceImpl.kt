package chatox.chat.service.impl

import chatox.chat.api.response.UserResponse
import chatox.chat.mapper.UserMapper
import chatox.chat.model.User
import chatox.chat.repository.mongodb.UserRepository
import chatox.chat.service.UserService
import chatox.platform.cache.ReactiveCacheService
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class UserServiceImpl(private val userRepository: UserRepository,
                      private val userCacheService: ReactiveCacheService<User, String>,
                      private val userCacheWrapper: ReactiveRepositoryCacheWrapper<User, String>,
                      private val userMapper: UserMapper) : UserService {

    override fun findUserById(id: String): Mono<UserResponse> {
        return mono {
            var user = userCacheService.find(id).awaitFirstOrNull()

            if (user == null) {
                user = userRepository.findById(id).awaitFirst()
                userCacheService.put(user).subscribe()
            }

            return@mono userMapper.toUserResponse(user!!)
        }
    }

    override fun findUserByIdAndPutInLocalCache(id: String?, localCache: MutableMap<String, UserResponse>?): Mono<UserResponse> {
        return mono {
            if (id == null) {
                return@mono null
            }

            if (localCache != null && localCache.containsKey(id)) {
                return@mono localCache[id]!!
            } else {
                val user = findUserById(id).awaitFirst()

                if (localCache != null) {
                    localCache[id] = user
                }

                return@mono user
            }
        }
    }

    override fun findAllByIdAndPutInLocalCache(ids: List<String>, localCache: MutableMap<String, UserResponse>?): Flux<UserResponse> {
        return mono {
            if (ids.isEmpty()) {
                return@mono listOf<UserResponse>()
            }

            val users = localCache
                    ?.filter { (key, _) -> ids.contains(key)}
                    ?.map { (_, value) -> value }
                    ?.toMutableList()
                    ?: mutableListOf()

            if (users.size == ids.size) {
                return@mono users
            }

            val presentIds = users.map { user -> user.id }
            val notPresentIds = ids.filterNot { id -> presentIds.contains(id) }

            val remainingUsers = userCacheWrapper
                    .findByIds(notPresentIds)
                    .collectList()
                    .awaitFirst()
                    .map { user -> userMapper.toUserResponse(user) }

            users.addAll(remainingUsers)

            if (localCache != null) {
                remainingUsers.forEach { user -> localCache[user.id] = user }
            }

            return@mono users
        }
                .flatMapMany { Flux.fromIterable(it) }
    }
}
