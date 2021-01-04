package chatox.platform.cache;

import reactor.core.publisher.Mono;

public interface ReactiveCacheService<ID, T> {
    Mono<T> find(ID id);
    Mono<T> put(T value);
    Mono<Void> delete(ID id);
}
