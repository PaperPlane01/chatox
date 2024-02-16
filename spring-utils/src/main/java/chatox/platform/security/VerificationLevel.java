package chatox.platform.security;

import chatox.platform.security.jwt.JwtPayload;
import lombok.Getter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Getter
public enum VerificationLevel {
    ANONYMOUS(1),
    REGISTERED(2),
    EMAIL_VERIFIED(3);

    private final int level;

    VerificationLevel(int level) {
        this.level = level;
    }

    private static final String ROLE_ANONYMOUS_USER = "ROLE_ANONYMOUS_USER";

    public static VerificationLevel fromJwtPayload(JwtPayload jwtPayload) {
        return getVerificationLevel(
                jwtPayload.getAuthorities()
                        .stream()
                        .map(SimpleGrantedAuthority::getAuthority)
                        .anyMatch(role -> role.equals(ROLE_ANONYMOUS_USER)),
                jwtPayload.getEmail()
        );
    }

    public static VerificationLevel getVerificationLevel(boolean userAnonymous, String email) {
        if (userAnonymous) {
            return VerificationLevel.ANONYMOUS;
        }

        if (email != null) {
            return VerificationLevel.EMAIL_VERIFIED;
        } else {
            return VerificationLevel.REGISTERED;
        }
    }
}
