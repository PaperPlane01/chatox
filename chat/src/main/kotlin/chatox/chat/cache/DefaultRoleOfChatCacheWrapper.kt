package chatox.chat.cache

import chatox.chat.config.CacheWrappersConfig
import chatox.chat.config.RedisConfig
import chatox.chat.exception.metadata.NoDefaultChatRoleException
import chatox.chat.model.ChatRole
import chatox.chat.repository.mongodb.ChatRoleRepository
import chatox.platform.cache.ReactiveCacheService
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Component
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.util.function.Function

@Component(CacheWrappersConfig.DEFAULT_ROLE_OF_CHAT_CACHE_WRAPPER)
class DefaultRoleOfChatCacheWrapper @Autowired constructor(
        @Qualifier(RedisConfig.DEFAULT_ROLE_OF_CHAT_CACHE_SERVICE)
        private val cacheService: ReactiveCacheService<ChatRole, String>,
        private val chatRoleRepository: ChatRoleRepository
) : ReactiveRepositoryCacheWrapper<ChatRole, String> {
    override fun findById(id: String): Mono<ChatRole> {
        return findById(
                id = id,
                putInCacheIfAbsent = true
        )
    }

    override fun findById(id: String, exceptionFunction: Function<String, RuntimeException>): Mono<ChatRole> {
        return findByChatId(
                chatId = id,
                putInCacheIfAbsent = true,
                exceptionFunction = exceptionFunction
        )
    }

    override fun findById(id: String, putInCacheIfAbsent: Boolean): Mono<ChatRole> {
        return findByChatId(
                chatId = id,
                putInCacheIfAbsent = putInCacheIfAbsent
        )
    }

    fun findByChatId(chatId: String, putInCacheIfAbsent: Boolean = true): Mono<ChatRole> = findByChatId(
            chatId = chatId,
            putInCacheIfAbsent = putInCacheIfAbsent
    ) { id -> NoDefaultChatRoleException("Chat $id doesn't have a default role") }

    fun findByChatId(chatId: String, putInCacheIfAbsent: Boolean, exceptionFunction: Function<String, RuntimeException>): Mono<ChatRole> {
        return mono {
            var role = cacheService.find(chatId).awaitFirstOrNull()

            if (role != null) {
                return@mono role
            } else {
                role = chatRoleRepository.findByChatIdAndDefaultTrue(chatId).awaitFirstOrNull()

                if (role == null) {
                    throw exceptionFunction.apply(chatId)
                }

                if (putInCacheIfAbsent) {
                    cacheService.put(role).subscribe()
                }

                return@mono role
            }
        }
    }

    override fun findByIds(ids: MutableList<String>): Flux<ChatRole> {
        return findByIds(ids, true)
    }

    override fun findByIds(ids: MutableList<String>, putInCacheIfAbsent: Boolean): Flux<ChatRole> {
        return mono {
            val roles = cacheService.find(ids).awaitFirst()

            if (roles.size == ids.size) {
                return@mono roles
            }

            val foundChatIds = roles.map { role -> role.chatId }
            val missingChatIds = ids.filter { chatId -> !foundChatIds.contains(chatId) }
            val missingRoles = chatRoleRepository.findByChatIdIn(missingChatIds).collectList().awaitFirst()

            if (putInCacheIfAbsent) {
                cacheService.put(missingRoles).awaitFirst()
            }

            roles.addAll(missingRoles)

            return@mono roles
        }
                .flatMapMany { Flux.fromIterable(it) }
    }
}