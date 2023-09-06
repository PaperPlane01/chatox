package chatox.platform.cache;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.PropertyAccessorFactory;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
public class DefaultReactiveRepositoryCacheWrapper<T, ID, RepositoryType extends ReactiveCrudRepository<T, ID>> implements ReactiveRepositoryCacheWrapper<T, ID> {
    private final ReactiveCacheService<T, ID> reactiveCacheService;
    private final RepositoryType reactiveCrudRepository;
    private final BiFunction<RepositoryType, ID, Mono<T>> repositoryCall;
    private final Function<T, ID> idProvider;

    public DefaultReactiveRepositoryCacheWrapper(ReactiveCacheService<T, ID> reactiveCacheService, RepositoryType reactiveCrudRepository) {
        this(reactiveCacheService, reactiveCrudRepository, ReactiveCrudRepository::findById);
    }

    public DefaultReactiveRepositoryCacheWrapper(ReactiveCacheService<T, ID> reactiveCacheService, RepositoryType reactiveCrudRepository, BiFunction<RepositoryType, ID, Mono<T>> repositoryCallOverride) {
        this(reactiveCacheService, reactiveCrudRepository, repositoryCallOverride, null);
    }

    public DefaultReactiveRepositoryCacheWrapper(ReactiveCacheService<T, ID> reactiveCacheService, RepositoryType reactiveCrudRepository, Function<T, ID> idProvider) {
        this(reactiveCacheService, reactiveCrudRepository, ReactiveCrudRepository::findById, idProvider);
    }

    public DefaultReactiveRepositoryCacheWrapper(ReactiveCacheService<T, ID> reactiveCacheService, RepositoryType reactiveCrudRepository, BiFunction<RepositoryType, ID, Mono<T>> repositoryCallOverride, Function<T, ID> idProvider) {
        this.reactiveCacheService = reactiveCacheService;
        this.reactiveCrudRepository = reactiveCrudRepository;
        this.repositoryCall = repositoryCallOverride;
        this.idProvider = idProvider;
    }

    @Override
    public Mono<T> findById(ID id) {
        return findById(id, true);
    }

    @Override
    public Flux<T> findByIds(List<ID> ids) {
        return findByIds(ids, true);
    }

    @Override
    public Flux<T> findByIds(List<ID> ids, boolean putInCacheIfAbsent) {
        return reactiveCacheService
                .find(ids)
                .flatMapMany(result -> {
                    if (result.size() == ids.size()) {
                        return Flux.fromIterable(result);
                    }

                    var resultIds = result.stream()
                            .map(this::getId)
                            .collect(Collectors.toList());
                    var notMatchedIds = ids.stream()
                            .filter(id -> !resultIds.contains(id))
                            .collect(Collectors.toList());

                    return reactiveCrudRepository
                            .findAllById(notMatchedIds)
                            .collectList()
                            .flatMapMany(objects -> {
                                if (objects.isEmpty()) {
                                    return Flux.fromIterable(result);
                                }

                                if (putInCacheIfAbsent) {
                                    return reactiveCacheService.put(objects).flatMapMany($ -> {
                                        result.addAll(objects);
                                        return Flux.fromIterable(result);
                                    });
                                } else {
                                    return Flux.fromIterable(result);
                                }
                            });
                });
    }

    @SuppressWarnings("unchecked")
    private ID getId(T object) {
        if (idProvider != null) {
            return idProvider.apply(object);
        }

        log.warn("Using unsafe method to retrieve object ID. If you see this warning, please consider " +
                "passing ID provider to {} for class {}", this.getClass(), object.getClass());
        var beanWrapper = PropertyAccessorFactory.forDirectFieldAccess(object);

        return (ID) beanWrapper.getPropertyValue("id");
    }

    @Override
    public Mono<T> findById(ID id, Function<ID, RuntimeException> exceptionFunction) {
        return findById(id, true)
                .switchIfEmpty(Mono.error(exceptionFunction.apply(id)));
    }

    @Override
    public Mono<T> findById(ID id, boolean putInCacheIfAbsent) {
        return reactiveCacheService.find(id)
                .switchIfEmpty(Mono.defer(() -> findInRepository(id)
                        .publishOn(Schedulers.boundedElastic())
                        .map(object -> {
                            if (putInCacheIfAbsent) {
                                log.info("Saving to cache after cache miss");
                                putInCache(object).subscribe();
                            }

                            return object;
                        })));
    }

    private Mono<T> putInCache(T value) {
        return reactiveCacheService.put(value);
    }

    private Mono<T> findInRepository(ID id) {
        log.info("Cache miss with object id {}", id);
        return repositoryCall.apply(reactiveCrudRepository, id);
    }
}
