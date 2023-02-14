package chatox.platform.security.jwt;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Collectors;

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
        var clientId = replaceIfNull(token.getClaimAsString(Claims.CLIENT_ID), "");

        id = replaceIfNull(token.getClaimAsString(Claims.USER_ID), clientId);
        accountId = replaceIfNull(token.getClaimAsString(Claims.ACCOUNT_ID), clientId);
        username = replaceIfNull(token.getClaimAsString(Claims.USERNAME), clientId);
        email = token.getClaimAsString(Claims.EMAIL);

        var jwtAuthorities = replaceIfNull(token.getClaimAsStringList(Claims.AUTHORITIES), List::<String>of)
                .stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
        var jwtScope = replaceIfNull(token.getClaimAsStringList(Claims.SCOPE), List::<String>of)
                .stream()
                .map(scope -> new SimpleGrantedAuthority("SCOPE_" + scope))
                .collect(Collectors.toList());

        authorities = new ArrayList<>();
        authorities.addAll(jwtAuthorities);
        authorities.addAll(jwtScope);

        if (token.containsClaim(Claims.GLOBAL_BAN_ID)) {
            globalBanInfo = new GlobalBanInfo();
            globalBanInfo.setId(token.getClaimAsString(Claims.GLOBAL_BAN_ID));

            if (token.containsClaim(Claims.GLOBAL_BAN_EXPIRATION_DATE)) {
                globalBanInfo.setExpiresAt(ZonedDateTime.ofInstant(
                        token.getClaimAsInstant(Claims.GLOBAL_BAN_EXPIRATION_DATE),
                        ZoneId.of("UTC")
                ));
            }

            globalBanInfo.setPermanent(token.containsClaim(Claims.GLOBAL_BAN_PERMANENT)
                    && token.getClaimAsBoolean(Claims.GLOBAL_BAN_PERMANENT));
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
        return getAuthorities().stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
    }
}
