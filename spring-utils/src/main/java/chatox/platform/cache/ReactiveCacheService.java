package chatox.platform.cache;

import reactor.core.publisher.Mono;

import java.util.List;

public interface ReactiveCacheService<T, ID> {
    Mono<T> find(ID id);
    Mono<List<T>> find(List<ID> ids);
    Mono<T> put(T value);
    Mono<List<T>> put(List<T> values);
    Mono<Void> delete(ID id);
    Mono<Void> deleteAll();
}
