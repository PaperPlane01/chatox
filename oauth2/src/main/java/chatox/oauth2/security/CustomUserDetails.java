package chatox.oauth2.security;

import chatox.oauth2.domain.Account;
import chatox.oauth2.domain.GlobalBan;
import chatox.oauth2.domain.Role;
import chatox.oauth2.domain.UserRole;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class CustomUserDetails implements UserDetails {
    @Getter
    private List<Role> roles;

    @Getter
    private String accountId;
    @Getter
    private String userId;
    private String password;
    private String username;
    private boolean locked;
    private boolean enabled;
    @Getter
    private String email;

    public CustomUserDetails(Account account) {
        roles = account.getRoles().stream().map(UserRole::getRole).collect(Collectors.toList());
        password = account.getPasswordHash();
        username = account.getUsername();
        locked = account.isLocked();
        enabled = account.isEnabled();
        accountId = account.getId();
        email = account.getEmail();

        if (account.getUserIds() != null && !account.getUserIds().isEmpty()) {
            userId = account.getUserIds().get(0);
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream().map(Enum::name).map(SimpleGrantedAuthority::new).collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !locked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
