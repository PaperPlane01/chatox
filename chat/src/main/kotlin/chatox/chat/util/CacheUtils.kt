package chatox.chat.util

import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import reactor.core.publisher.Mono

fun <T> putInLocalCache(item: T, cache: MutableMap<String, T>?, extractKey: (T) -> String): T {
    if (cache == null) {
        return item
    }

    cache[extractKey(item)] = item
    return item
}

fun <K, V> getOptionalFromCache(
        key: K?,
        localCache: MutableMap<K, V>?,
        findValue: (K) -> Mono<V>
) = mono {
    if (key == null) {
        return@mono null
    }

    if (localCache != null && localCache.containsKey(key)) {
        return@mono localCache[key]!!
    }

    val value = findValue(key).awaitFirstOrNull()

    if (value != null && localCache != null) {
        localCache[key] = value
    }

    return@mono value
}