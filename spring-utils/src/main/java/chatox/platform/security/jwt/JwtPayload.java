package chatox.platform.security.jwt;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.function.Supplier;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtPayload implements UserDetails {
    private String id;
    private String accountId;
    private Collection<SimpleGrantedAuthority> authorities;
    private String email;
    private String username;
    private GlobalBanInfo globalBanInfo;

    private static final String ROLE_ADMIN = "ROLE_ADMIN";

    public JwtPayload(JwtAuthenticationToken jwtAuthenticationToken) {
        var token = jwtAuthenticationToken.getToken();
        var clientId = replaceIfNull(token.getClaimAsString(AccessTokenClaims.CLIENT_ID.getValue()), "");

        id = replaceIfNull(token.getClaimAsString(AccessTokenClaims.USER_ID.getValue()), clientId);
        accountId = replaceIfNull(token.getClaimAsString(AccessTokenClaims.ACCOUNT_ID.getValue()), clientId);
        username = replaceIfNull(token.getClaimAsString(AccessTokenClaims.USERNAME.getValue()), clientId);
        email = token.getClaimAsString(AccessTokenClaims.EMAIL.getValue());

        var jwtAuthorities = replaceIfNull(token.getClaimAsStringList(AccessTokenClaims.AUTHORITIES.getValue()), List::<String>of)
                .stream()
                .map(SimpleGrantedAuthority::new)
                .toList();
        var jwtScope = replaceIfNull(token.getClaimAsStringList(AccessTokenClaims.SCOPE.getValue()), List::<String>of)
                .stream()
                .map(scope -> new SimpleGrantedAuthority("SCOPE_" + scope))
                .toList();

        authorities = new ArrayList<>();
        authorities.addAll(jwtAuthorities);
        authorities.addAll(jwtScope);

        if (token.hasClaim(AccessTokenClaims.GLOBAL_BAN_ID.getValue())) {
            globalBanInfo = new GlobalBanInfo();
            globalBanInfo.setId(token.getClaimAsString(AccessTokenClaims.GLOBAL_BAN_ID.getValue()));

            if (token.hasClaim(AccessTokenClaims.GLOBAL_BAN_EXPIRATION_DATE.getValue())) {
                globalBanInfo.setExpiresAt(ZonedDateTime.ofInstant(
                        token.getClaimAsInstant(AccessTokenClaims.GLOBAL_BAN_EXPIRATION_DATE.getValue()),
                        ZoneOffset.UTC
                ));
            }

            globalBanInfo.setPermanent(token.hasClaim(AccessTokenClaims.GLOBAL_BAN_PERMANENT.getValue())
                    && token.getClaimAsBoolean(AccessTokenClaims.GLOBAL_BAN_PERMANENT.getValue()));
        }
    }

    private <T> T replaceIfNull(T value, Supplier<T> alternative) {
        if (value != null) {
            return value;
        }

        return alternative.get();
    }

    private <T> T replaceIfNull(T value, T alternative) {
        if (value != null) {
            return value;
        }

        return alternative;
    }

    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public boolean isBannedGlobally() {
        if (isAdmin()) {
            return false;
        }

        if (globalBanInfo == null) {
            return false;
        }

        if (globalBanInfo.isPermanent()) {
            return true;
        }

        return globalBanInfo.getExpiresAt() != null && globalBanInfo.getExpiresAt().isAfter(ZonedDateTime.now());
    }

    public boolean isAdmin() {
        return getAuthorities().stream().anyMatch(authority -> authority.getAuthority().equals(ROLE_ADMIN));
    }
}
