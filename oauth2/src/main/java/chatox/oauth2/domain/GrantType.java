package chatox.oauth2.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.AuthorizationGrantType;

@RequiredArgsConstructor
@Getter
public enum GrantType {
    client_credentials,
    password,
    refresh_token;
}
