package chatox.platform.cache.redis;

import chatox.platform.cache.CacheKeyGenerator;
import chatox.platform.cache.ReactiveCacheService;
import chatox.platform.util.Maps;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class RedisReactiveCacheService<T> implements ReactiveCacheService<T, String> {
    private final ReactiveRedisTemplate<String, T> redisTemplate;
    private final CacheKeyGenerator cacheKeyGenerator;
    private final Class<T> valueClass;
    private final Function<T, String> keySourceFunction;

    @Override
    public Mono<T> find(String id) {
        return redisTemplate.opsForValue().get(generateKey(id));
    }

    @Override
    public Mono<List<T>> find(List<String> ids) {
        return redisTemplate
                .opsForValue()
                .multiGet(ids.stream().map(this::generateKey).collect(Collectors.toList()));
    }

    @Override
    public Mono<T> put(T value) {
        return redisTemplate
                .opsForValue()
                .set(generateKey(keySourceFunction.apply(value)), value)
                .then(Mono.just(value));
    }

    @Override
    public Mono<List<T>> put(List<T> values) {
        return redisTemplate
                .opsForValue()
                .multiSet(Maps.toMap(values, value -> generateKey(keySourceFunction.apply(value))))
                .then(Mono.just(values));
    }

    @Override
    public Mono<Void> delete(String id) {
        return redisTemplate
                .opsForValue()
                .delete(generateKey(id))
                .then(Mono.empty());
    }

    private String generateKey(String source) {
        return cacheKeyGenerator.generateKey(source, valueClass);
    }
}
