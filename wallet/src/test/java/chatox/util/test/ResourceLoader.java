package chatox.util.test;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.SneakyThrows;
import org.apache.commons.io.IOUtils;

import java.nio.charset.StandardCharsets;

public class ResourceLoader {
    private static ObjectMapper objectMapper = new ObjectMapper();

    public static ObjectMapper getObjectMapper() {
        return objectMapper;
    }

    public static void setObjectMapper(ObjectMapper objectMapper) {
        ResourceLoader.objectMapper = objectMapper;
    }

    @SneakyThrows
    public static <T> T loadResource(String fileName, Class<T> targetClass) {
        var json = IOUtils.resourceToString(fileName, StandardCharsets.UTF_8);
        return objectMapper.readValue(json, targetClass);
    }
}
