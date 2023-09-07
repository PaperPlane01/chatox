package chatox.user.util

import reactor.core.publisher.Mono

fun <O, ID> findAndPutToCache(
        objectProvider: () -> Mono<O>,
        id: ID,
        cache: MutableMap<ID, O>
): Mono<O> {
    if (cache.containsKey(id)) {
        return Mono.just(cache[id]!!)
    }

    return objectProvider()
            .mapNotNull { target ->
                cache[id] =target
                return@mapNotNull target
            }
}