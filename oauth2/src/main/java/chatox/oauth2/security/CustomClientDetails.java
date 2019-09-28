package chatox.oauth2.security;

import chatox.oauth2.domain.AuthorizedGrantType;
import chatox.oauth2.domain.Client;
import chatox.oauth2.domain.Scope;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.provider.ClientDetails;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class CustomClientDetails implements ClientDetails {
    private String clientId;
    private String secret;
    private Set<String> scope;
    private Set<String> authorizedGrantTypes;
    private String redirectUri;
    private Integer accessTokenValidity;
    private Integer refreshTokenValidity;

    public CustomClientDetails(Client client) {
        clientId = client.getId();
        secret = client.getSecretHash();
        scope = client.getScope().stream().map(Scope::getName).collect(Collectors.toSet());
        authorizedGrantTypes = client.getAuthorizedGrantTypes().stream().map(AuthorizedGrantType::getName).collect(Collectors.toSet());
        redirectUri = client.getRedirectUri();
        accessTokenValidity = client.getAccessTokenValidity();
        refreshTokenValidity = client.getRefreshTokenValidity();
    }

    @Override
    public String getClientId() {
        return clientId;
    }

    @Override
    public Set<String> getResourceIds() {
        return Collections.emptySet();
    }

    @Override
    public boolean isSecretRequired() {
        return true;
    }

    @Override
    public String getClientSecret() {
        return secret;
    }

    @Override
    public boolean isScoped() {
        return true;
    }

    @Override
    public Set<String> getScope() {
        return scope;
    }

    @Override
    public Set<String> getAuthorizedGrantTypes() {
        return authorizedGrantTypes;
    }

    @Override
    public Set<String> getRegisteredRedirectUri() {
        return new HashSet<>(Arrays.asList(redirectUri));
    }

    @Override
    public Collection<GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

    @Override
    public Integer getAccessTokenValiditySeconds() {
        return accessTokenValidity;
    }

    @Override
    public Integer getRefreshTokenValiditySeconds() {
        return refreshTokenValidity;
    }

    @Override
    public boolean isAutoApprove(String scope) {
        return false;
    }

    @Override
    public Map<String, Object> getAdditionalInformation() {
        return Map.of();
    }
}
