package chatox.platform.cache;

public class DefaultCacheKeyGenerator implements CacheKeyGenerator {
    private final String prefix;
    private final CacheKeyGenerator.ClassKeyMode defaultClassKeyMode;
    private final String delimiter;

    private static final String ALL_KEYS = "*";

    public DefaultCacheKeyGenerator() {
        this(null, ClassKeyMode.SIMPLE, "-");
    }

    public DefaultCacheKeyGenerator(String prefix) {
        this(prefix, ClassKeyMode.SIMPLE, "-");
    }

    public DefaultCacheKeyGenerator(String prefix, ClassKeyMode defaultClassKeyMode) {
        this(prefix, defaultClassKeyMode, "-");
    }

    public DefaultCacheKeyGenerator(String prefix, ClassKeyMode defaultClassKeyMode, String delimiter) {
        this.prefix = prefix;
        this.defaultClassKeyMode = defaultClassKeyMode;
        this.delimiter = delimiter;
    }

    @Override
    public String generateKey(String source) {
        return prefix != null
                ? prefix + delimiter + source
                : source;
    }

    @Override
    public String generateKey(String source, Class<?> clazz) {
        return generateKey(source, clazz, defaultClassKeyMode, delimiter);
    }

    @Override
    public String generateKey(String source, Class<?> clazz, ClassKeyMode classKeyMode) {
        return generateKey(source, clazz, classKeyMode, delimiter);
    }

    @Override
    public String generateKey(String source, Class<?> clazz, ClassKeyMode classKeyMode, String delimiter) {
        return getKeyPrefix(clazz, classKeyMode, delimiter) + source;
    }

    @Override
    public String getAllKeysPattern(Class<?> clazz) {
        return getAllKeysPattern(clazz, defaultClassKeyMode, delimiter);
    }

    @Override
    public String getAllKeysPattern(Class<?> clazz, ClassKeyMode classKeyMode) {
        return getAllKeysPattern(clazz, classKeyMode, delimiter);
    }

    @Override
    public String getAllKeysPattern(Class<?> clazz, ClassKeyMode classKeyMode, String delimiter) {
        return getKeyPrefix(clazz, classKeyMode, delimiter) + ALL_KEYS;
    }

    private String getKeyPrefix(Class<?> clazz, ClassKeyMode classKeyMode, String delimiter) {
        String keyPrefix;

        if (classKeyMode == ClassKeyMode.SIMPLE) {
            keyPrefix = clazz.getSimpleName() + delimiter;
        } else {
            keyPrefix = clazz.getName() + delimiter;
        }

        if (prefix != null) {
            keyPrefix = prefix + delimiter + keyPrefix;
        }

        return keyPrefix;
    }
}
