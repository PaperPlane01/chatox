package chatox.oauth2.security.token;

import chatox.oauth2.respository.GlobalBanRepository;
import chatox.oauth2.security.CustomUserDetails;
import chatox.platform.security.jwt.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtCustomizer implements OAuth2TokenCustomizer<JwtEncodingContext> {
    private final GlobalBanRepository globalBanRepository;

    @Override
    public void customize(JwtEncodingContext context) {;
        if (context.getPrincipal().getPrincipal() instanceof CustomUserDetails user) {
            var claims = context.getClaims()
                    .claim(Claims.ACCOUNT_ID, user.getAccountId())
                    .claim(Claims.USER_ID, user.getUserId())
                    .claim(Claims.EMAIL, user.getEmail());

            var lastActiveBan = globalBanRepository.findLastActiveBanOfAccount(user.getAccountId());

            lastActiveBan.ifPresent(ban -> {
                claims.claim(Claims.GLOBAL_BAN_ID, ban.getId());
                claims.claim(Claims.GLOBAL_BAN_PERMANENT, ban.isPermanent());

                if (ban.getExpiresAt() != null) {
                    claims.claim(Claims.GLOBAL_BAN_EXPIRATION_DATE, ban.getExpiresAt().toInstant().getEpochSecond());
                }
            });
        }
    }
}
