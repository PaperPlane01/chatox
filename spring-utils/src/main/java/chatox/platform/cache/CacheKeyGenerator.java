package chatox.platform.cache;

import java.util.function.Function;

public interface CacheKeyGenerator {
    String generateKey(String source);
    String generateKey(String source, Class clazz);
    String generateKey(String source, Class clazz, ClassKeyMode classKeyMode);
    String generateKey(String source, Class clazz, ClassKeyMode classKeyMode, String delimiter);

    enum ClassKeyMode {
        SIMPLE,
        FULL
    }
}
