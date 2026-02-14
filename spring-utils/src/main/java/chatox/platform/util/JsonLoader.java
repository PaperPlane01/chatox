package chatox.platform.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.FileCopyUtils;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.cfg.EnumFeature;
import tools.jackson.databind.json.JsonMapper;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class JsonLoader {
    private static JsonMapper jsonMapper = JsonMapper.builder()
            .findAndAddModules()
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .disable(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES)
            .disable(EnumFeature.READ_ENUMS_USING_TO_STRING)
            .build();

    public static JsonMapper getJsonMapper() {
        return jsonMapper;
    }

    public static void setJsonMapper(JsonMapper jsonMapper) {
        JsonLoader.jsonMapper = jsonMapper;
    }

    @SneakyThrows
    public static <T> T loadResource(String fileName, Class<T> targetClass) {
        return jsonMapper.readValue(loadJsonFromResource(fileName), targetClass);
    }

    @SneakyThrows
    public static <T> T loadResource(String fileName, TypeReference<T> typeReference) {
        return jsonMapper.readValue(loadJsonFromResource(fileName), typeReference);
    }

    @SneakyThrows
    private static String loadJsonFromResource(String fileName) {
        var classPathResource = new ClassPathResource(fileName);
        var bytes = FileCopyUtils.copyToByteArray(classPathResource.getInputStream());

        return new String(bytes);
    }
}
