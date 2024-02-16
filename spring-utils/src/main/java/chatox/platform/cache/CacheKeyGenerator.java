package chatox.platform.cache;

public interface CacheKeyGenerator {
    String generateKey(String source);
    String generateKey(String source, Class<?> clazz);
    String generateKey(String source, Class<?> clazz, ClassKeyMode classKeyMode);
    String generateKey(String source, Class<?> clazz, ClassKeyMode classKeyMode, String delimiter);
    String getAllKeysPattern(Class<?> clazz);
    String getAllKeysPattern(Class<?> clazz, ClassKeyMode classKeyMode);
    String getAllKeysPattern(Class<?> clazz, ClassKeyMode classKeyMode, String delimiter);

    enum ClassKeyMode {
        SIMPLE,
        FULL
    }
}
