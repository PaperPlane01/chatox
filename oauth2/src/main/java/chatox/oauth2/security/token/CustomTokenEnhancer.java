package chatox.oauth2.security.token;

import chatox.oauth2.respository.AccountRepository;
import chatox.oauth2.respository.GlobalBanRepository;
import chatox.oauth2.security.CustomUserDetails;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.common.DefaultOAuth2AccessToken;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.token.TokenEnhancer;

import java.util.HashMap;
import java.util.Map;

@Slf4j
public class CustomTokenEnhancer implements TokenEnhancer {
    @Autowired
    private GlobalBanRepository globalBanRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Override
    public OAuth2AccessToken enhance(OAuth2AccessToken accessToken, OAuth2Authentication authentication) {
        if (authentication.getPrincipal() instanceof CustomUserDetails) {
            log.trace("Enhancing access token with custom data");
            Map<String, Object> additionalInformation = new HashMap<>();
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            additionalInformation.put("account_id", userDetails.getAccountId());
            additionalInformation.put("user_id", userDetails.getUserId());
            additionalInformation.put("email", userDetails.getEmail());
            log.trace("User email is {}", userDetails.getEmail());

            var account = accountRepository.findById(userDetails.getAccountId()).get();
            var lastActiveBan = globalBanRepository.findLastActiveBanOfAccount(account);

            lastActiveBan.ifPresent(activeBan -> {
                additionalInformation.put("global_ban_id", activeBan.getId());

                if (activeBan.getExpiresAt() != null) {
                    additionalInformation.put("global_ban_expiration_date", activeBan.getExpiresAt().toInstant().getEpochSecond());
                }

                additionalInformation.put("global_ban_permanent", activeBan.isPermanent());
            });

            ((DefaultOAuth2AccessToken) accessToken).setAdditionalInformation(additionalInformation);
        }

        return accessToken;
    }
}
