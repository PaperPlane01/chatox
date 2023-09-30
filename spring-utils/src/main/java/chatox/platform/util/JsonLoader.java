package chatox.platform.util;

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
        var classPathResource = new ClassPathResource(fileName);
        var bytes = FileCopyUtils.copyToByteArray(classPathResource.getInputStream());
        var json = new String(bytes);

        return objectMapper.readValue(json, targetClass);
    }
}
