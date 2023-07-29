package chatox.wallet.security.jwt;

import lombok.Getter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.Collection;

public class JwtAuthentication implements Authentication {
    @Getter
    private JwtPayload jwtPayload;
    private boolean authenticated = false;

    public JwtAuthentication(JwtAuthenticationToken token) {
        this.jwtPayload = new JwtPayload(token);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return jwtPayload.getAuthorities();
    }

    @Override
    public Object getCredentials() {
        return jwtPayload;
    }

    @Override
    public Object getDetails() {
        return jwtPayload;
    }

    @Override
    public Object getPrincipal() {
        return jwtPayload;
    }

    @Override
    public boolean isAuthenticated() {
        return authenticated;
    }

    @Override
    public void setAuthenticated(boolean authenticated) throws IllegalArgumentException {
        this.authenticated = authenticated;
    }

    @Override
    public String getName() {
        return jwtPayload.getUsername();
    }
}
