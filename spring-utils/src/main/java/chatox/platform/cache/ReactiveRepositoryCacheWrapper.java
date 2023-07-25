package chatox.platform.cache;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.function.Function;

public interface ReactiveRepositoryCacheWrapper<T, ID> {
    Mono<T> findById(ID id);
    Flux<T> findByIds(List<ID> ids);
    Flux<T> findByIds(List<ID> ids, boolean putInCacheIfAbsent);
    Mono<T> findById(ID id, boolean putInCacheIfAbsent);
    Mono<T> findById(ID id, Function<ID, RuntimeException> exceptionFunction);
}
