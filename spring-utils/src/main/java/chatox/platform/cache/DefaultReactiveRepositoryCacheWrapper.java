package chatox.platform.cache;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

import java.util.function.BiFunction;
import java.util.function.Function;

public class DefaultReactiveRepositoryCacheWrapper<T, ID, RepositoryType extends ReactiveCrudRepository<T, ID>> implements ReactiveRepositoryCacheWrapper<T, ID> {
    private final ReactiveCacheService<T, ID> reactiveCacheService;
    private final RepositoryType reactiveCrudRepository;
    private final BiFunction<RepositoryType, ID, Mono<T>> repositoryCall;

    public DefaultReactiveRepositoryCacheWrapper(ReactiveCacheService<T, ID> reactiveCacheService, RepositoryType reactiveCrudRepository) {
        this(reactiveCacheService, reactiveCrudRepository, ReactiveCrudRepository::findById);
    }

    public DefaultReactiveRepositoryCacheWrapper(ReactiveCacheService<T, ID> reactiveCacheService, RepositoryType reactiveCrudRepository, BiFunction<RepositoryType, ID, Mono<T>> repositoryCallOverride) {
        this.reactiveCacheService = reactiveCacheService;
        this.reactiveCrudRepository = reactiveCrudRepository;
        this.repositoryCall = repositoryCallOverride;
    }

    @Override
    public Mono<T> findById(ID id) {
        return findById(id, true);
    }

    @Override
    public Mono<T> findById(ID id, Function<ID, RuntimeException> exceptionFunction) {
        return findById(id, true)
                .switchIfEmpty(Mono.error(exceptionFunction.apply(id)));
    }

    @Override
    public Mono<T> findById(ID id, boolean putInCacheIfAbsent) {
        return reactiveCacheService.find(id)
                .switchIfEmpty(findInRepository(id, putInCacheIfAbsent));
    }

    private Mono<T> putInCache(T value) {
        return reactiveCacheService.put(value);
    }

    private Mono<T> findInRepository(ID id, boolean putInCacheIfAbsent) {
        return repositoryCall
                .apply(reactiveCrudRepository, id)
                .map(object -> {
                    if (putInCacheIfAbsent) {
                        putInCache(object).subscribe();
                    }

                    return object;
                });
    }
}
