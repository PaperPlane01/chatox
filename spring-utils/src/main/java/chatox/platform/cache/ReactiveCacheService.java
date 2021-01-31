package chatox.platform.cache;

import reactor.core.publisher.Mono;

public interface ReactiveCacheService<T, ID> {
    Mono<T> find(ID id);
    Mono<T> put(T value);
    Mono<Void> delete(ID id);
}
