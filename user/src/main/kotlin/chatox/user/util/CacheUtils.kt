package chatox.user.util

import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import reactor.core.publisher.Mono

fun <O, ID> findAndPutToCache(
        objectProvider: () -> Mono<O>,
        id: ID,
        cache: MutableMap<ID, O>
): Mono<O> {
    return mono {
        if (cache.containsKey(id)) {
            return@mono cache[id]!!
        }

        val target = objectProvider().awaitFirstOrNull()

        if (target != null) {
            cache[id] = target
        }

        return@mono target
    }
}