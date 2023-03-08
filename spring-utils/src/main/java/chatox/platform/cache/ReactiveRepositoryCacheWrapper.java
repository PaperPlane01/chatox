package chatox.platform.cache;

import reactor.core.publisher.Mono;

import java.util.function.Function;

public interface ReactiveRepositoryCacheWrapper<T, ID> {
    Mono<T> findById(ID id);
    Mono<T> findById(ID id, boolean putInCacheIfAbsent);
    Mono<T> findById(ID id, Function<ID, RuntimeException> exceptionFunction);
}
