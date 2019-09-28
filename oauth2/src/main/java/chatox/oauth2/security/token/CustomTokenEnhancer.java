package chatox.oauth2.security.token;

import chatox.oauth2.security.CustomUserDetails;
import org.springframework.security.oauth2.common.DefaultOAuth2AccessToken;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.token.TokenEnhancer;

import java.util.HashMap;
import java.util.Map;

public class CustomTokenEnhancer implements TokenEnhancer {
    @Override
    public OAuth2AccessToken enhance(OAuth2AccessToken accessToken, OAuth2Authentication authentication) {
        if (authentication.getPrincipal() instanceof CustomUserDetails) {
            Map<String, Object> additionalInformation = new HashMap<>();
            additionalInformation.put("account_id", ((CustomUserDetails) authentication.getPrincipal()).getAccountId());
            additionalInformation.put("user_id", ((CustomUserDetails) authentication.getPrincipal()).getUserId());
            ((DefaultOAuth2AccessToken) accessToken).setAdditionalInformation(additionalInformation);
        }

        return accessToken;
    }
}
