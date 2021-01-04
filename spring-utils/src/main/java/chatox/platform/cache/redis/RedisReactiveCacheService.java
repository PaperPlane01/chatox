package chatox.platform.cache.redis;

import chatox.platform.cache.CacheKeyGenerator;
import chatox.platform.cache.ReactiveCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import reactor.core.publisher.Mono;

import java.util.function.Function;

@RequiredArgsConstructor
public class RedisReactiveCacheService<T> implements ReactiveCacheService<String, T> {
    private final ReactiveRedisTemplate<String, T> redisTemplate;
    private final CacheKeyGenerator cacheKeyGenerator;
    private final Class<T> valueClass;
    private final Function<T, String> keySourceFunction;

    @Override
    public Mono<T> find(String id) {
        return redisTemplate.opsForValue().get(generateKey(id));
    }

    @Override
    public Mono<T> put(T value) {
        return redisTemplate.opsForValue()
                .set(generateKey(keySourceFunction.apply(value)), value)
                .then(Mono.just(value));
    }

    @Override
    public Mono<Void> delete(String id) {
        return redisTemplate.opsForValue().delete(generateKey(id))
                .then(Mono.empty());
    }

    private String generateKey(String source) {
        return cacheKeyGenerator.generateKey(source, valueClass);
    }
}
