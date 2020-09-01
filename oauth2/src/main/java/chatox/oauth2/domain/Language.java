package chatox.oauth2.domain;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

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
                .filter(enumValue -> enumValue.aliases.stream()
                        .map(String::toUpperCase)
                        .anyMatch(alias -> alias.equals(stringRepresentation))
                )
                .findFirst()
                .orElse(Language.EN);
    }

    public String getPrimaryAlias() {
        return aliases.get(0);
    }

    public String getPrimaryAliasLowerCase() {
        return getPrimaryAlias().toLowerCase();
    }
}
