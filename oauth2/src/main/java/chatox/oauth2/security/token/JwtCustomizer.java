package chatox.oauth2.security.token;

import chatox.oauth2.respository.GlobalBanRepository;
import chatox.oauth2.security.CustomUserDetails;
import chatox.platform.security.jwt.AccessTokenClaims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtCustomizer implements OAuth2TokenCustomizer<JwtEncodingContext> {
    private final GlobalBanRepository globalBanRepository;

    @Override
    public void customize(JwtEncodingContext context) {
        if (context.getPrincipal().getPrincipal() instanceof CustomUserDetails user) {
            var claims = context.getClaims()
                    .claim(AccessTokenClaims.ACCOUNT_ID.getValue(), user.getAccountId())
                    .claim(AccessTokenClaims.USER_ID.getValue(), user.getUserId())
                    .claim(
                            AccessTokenClaims.AUTHORITIES.getValue(),
                            user.getAuthorities()
                                    .stream()
                                    .map(GrantedAuthority::getAuthority)
                                    .toList()
                    )
                    .claim(AccessTokenClaims.SCOPE.getValue(), context.getAuthorizedScopes());

            if (user.getEmail() != null) {
                claims.claim(AccessTokenClaims.EMAIL.getValue(), user.getEmail());
            }

            var lastActiveBan = globalBanRepository.findLastActiveBanOfAccount(user.getAccountId());

            lastActiveBan.ifPresent(ban -> {
                claims.claim(AccessTokenClaims.GLOBAL_BAN_ID.getValue(), ban.getId());
                claims.claim(AccessTokenClaims.GLOBAL_BAN_PERMANENT.getValue(), ban.isPermanent());

                if (ban.getExpiresAt() != null) {
                    claims.claim(
                            AccessTokenClaims.GLOBAL_BAN_EXPIRATION_DATE.getValue(),
                            ban.getExpiresAt().toInstant().getEpochSecond()
                    );
                }
            });
        }
    }
}
