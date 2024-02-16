package chatox.oauth2.domain;

import org.springframework.security.oauth2.core.AuthorizationGrantType;

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
}
