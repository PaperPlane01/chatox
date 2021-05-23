package chatox.platform.cache;

public class DefaultCacheKeyGenerator implements CacheKeyGenerator {
    private String prefix;
    private CacheKeyGenerator.ClassKeyMode defaultClassKeyMode;
    private String delimiter;

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
    public String generateKey(String source, Class clazz) {
        return generateKey(source, clazz, defaultClassKeyMode, delimiter);
    }

    @Override
    public String generateKey(String source, Class clazz, ClassKeyMode classKeyMode) {
        return generateKey(source, clazz, classKeyMode, delimiter);
    }

    @Override
    public String generateKey(String source, Class clazz, ClassKeyMode classKeyMode, String delimiter) {
        String key;

        if (classKeyMode == ClassKeyMode.SIMPLE) {
            key = clazz.getSimpleName() + delimiter + source;
        } else {
            key = clazz.getName() + delimiter + source;
        }

        if (prefix != null) {
            key = prefix + delimiter + key;
        }

        return key;
    }
}
