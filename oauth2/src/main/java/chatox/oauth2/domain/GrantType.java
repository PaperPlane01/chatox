package chatox.oauth2.domain;

import chatox.oauth2.exception.InvalidAuthorizedGrantTypeException;
import org.codehaus.jackson.annotate.JsonCreator;
import org.springframework.security.oauth2.core.AuthorizationGrantType;

import java.util.stream.Stream;

public enum GrantType {
    client_credentials(AuthorizationGrantType.CLIENT_CREDENTIALS),

    @SuppressWarnings("deprecated")
    password(AuthorizationGrantType.PASSWORD),
    refresh_token(AuthorizationGrantType.REFRESH_TOKEN);

    private final AuthorizationGrantType authorizationGrantType;

    GrantType(AuthorizationGrantType authorizationGrantType) {
        this.authorizationGrantType = authorizationGrantType;
    }

    public AuthorizationGrantType toAuthorizationGrantType() {
        return authorizationGrantType;
    }

    @JsonCreator
    public static GrantType fromString(String name) {
        return Stream.of(GrantType.values())
                .filter(grantType -> grantType.name().equals(name))
                .findFirst()
                .orElseThrow(InvalidAuthorizedGrantTypeException::new);
    }
}
