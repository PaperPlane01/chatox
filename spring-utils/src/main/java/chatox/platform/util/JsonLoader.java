package chatox.platform.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.SneakyThrows;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.FileCopyUtils;

public class JsonLoader {
    private static ObjectMapper objectMapper = new ObjectMapper();

    static {
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        objectMapper.findAndRegisterModules();
    }

    public static ObjectMapper getObjectMapper() {
        return objectMapper;
    }

    public static void setObjectMapper(ObjectMapper objectMapper) {
        JsonLoader.objectMapper = objectMapper;
    }

    @SneakyThrows
    public static <T> T loadResource(String fileName, Class<T> targetClass) {
        return objectMapper.readValue(loadJsonFromResource(fileName), targetClass);
    }

    @SneakyThrows
    public static <T> T loadResource(String fileName, TypeReference<T> typeReference) {
        return objectMapper.readValue(loadJsonFromResource(fileName), typeReference);
    }

    @SneakyThrows
    private static String loadJsonFromResource(String fileName) {
        var classPathResource = new ClassPathResource(fileName);
        var bytes = FileCopyUtils.copyToByteArray(classPathResource.getInputStream());

        return new String(bytes);
    }
}
