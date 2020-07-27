package chatox.registration.api.request;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.util.Arrays;
import java.util.List;

public enum Language {
    EN("EN", "english"),
    RU("RU", "russian");

    private List<String> aliases;

    Language(String... aliases) {
        this.aliases = Arrays.asList(aliases);
    }

    @JsonCreator
    public static Language fromString(String string) {
        if (string == null || string.isBlank()) {
            return Language.EN;
        }

        String stringRepresentation = string.trim().toUpperCase();

        return Arrays.stream(Language.values())
                .filter(enumValue -> enumValue.aliases.contains(stringRepresentation))
                .findFirst()
                .orElse(Language.EN);
    }
}
