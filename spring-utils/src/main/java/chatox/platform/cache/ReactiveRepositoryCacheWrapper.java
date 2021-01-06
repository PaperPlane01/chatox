package chatox.platform.cache;

import lombok.RequiredArgsConstructor;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

import java.util.function.Function;

@RequiredArgsConstructor
public class ReactiveRepositoryCacheWrapper<T, ID> {
    private final ReactiveCacheService<T, ID> reactiveCacheService;
    private final ReactiveCrudRepository<T, ID> reactiveCrudRepository;

    public Mono<T> findById(ID id) {
        return findById(id, true);
    }

    public Mono<T> findById(ID id, Function<ID, RuntimeException> exceptionFunction) {
        return findById(id, true)
                .switchIfEmpty(Mono.error(exceptionFunction.apply(id)));
    }

    public Mono<T> findById(ID id, boolean putInCacheIfAbsent) {
        return reactiveCacheService.find(id)
                .switchIfEmpty(
                        reactiveCrudRepository.findById(id)
                                .map(object -> {
                                    if (putInCacheIfAbsent) {
                                        putInCache(object).subscribe();
                                    }

                                    return object;
                                })
                );
    }

    private Mono<T> putInCache(T value) {
        return reactiveCacheService.put(value);
    }
}
