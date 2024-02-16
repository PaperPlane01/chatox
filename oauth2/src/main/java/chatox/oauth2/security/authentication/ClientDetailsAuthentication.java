package chatox.oauth2.security.authentication;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;

import java.util.Collection;
import java.util.stream.Collectors;

public class ClientDetailsAuthentication implements Authentication {
    private final RegisteredClient registeredClient;
    private boolean authenticated = false;

    public ClientDetailsAuthentication(RegisteredClient registeredClient) {
        this.registeredClient = registeredClient;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return registeredClient.getScopes()
                .stream()
                .map(scope -> new SimpleGrantedAuthority("SCOPE_" + scope))
                .toList();
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public Object getDetails() {
        return registeredClient;
    }

    @Override
    public Object getPrincipal() {
        return registeredClient;
    }

    @Override
    public boolean isAuthenticated() {
        return authenticated;
    }

    @Override
    public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {
        authenticated = isAuthenticated;
    }

    @Override
    public String getName() {
        return registeredClient.getClientId();
    }
}
