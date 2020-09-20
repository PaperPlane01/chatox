package chatox.oauth2.security.token;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.common.util.OAuth2Utils;
import org.springframework.security.oauth2.provider.ClientDetails;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.OAuth2Request;
import org.springframework.security.oauth2.provider.token.store.JdbcTokenStore;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class TokenGeneratorHelper {
    private final TokenServicesFactory tokenServicesFactory;

    private JdbcTokenStore tokenStore;

    @Autowired
    public void setTokenStore(JdbcTokenStore jdbcTokenStore) {
        this.tokenStore = jdbcTokenStore;
    }

    public TokenPair generateTokenPair(UserDetails userDetails, ClientDetails clientDetails) {
        var accessToken = createToken(userDetails, clientDetails);

        return TokenPair.builder()
                .accessToken(accessToken.getValue())
                .refreshToken(accessToken.getRefreshToken() != null
                        ? accessToken.getRefreshToken().getValue()
                        : null
                )
                .build();
    }

    private OAuth2AccessToken createToken(UserDetails userDetails, ClientDetails clientDetails) {
        var authorizationParameters = new LinkedHashMap<String, String>();
        authorizationParameters.put(OAuth2Utils.SCOPE, convertScopeToString(clientDetails.getScope()));
        authorizationParameters.put(OAuth2Utils.CLIENT_ID, clientDetails.getClientId());
        authorizationParameters.put(OAuth2Utils.GRANT_TYPE, "implicit");

        String redirectUri = null;

        if (clientDetails.getRegisteredRedirectUri() != null
                && !clientDetails.getRegisteredRedirectUri().isEmpty()) {
            redirectUri = (new ArrayList<>(clientDetails.getRegisteredRedirectUri())).get(0);
        }
        var oAuth2Request = new OAuth2Request(
                authorizationParameters,
                clientDetails.getClientId(),
                userDetails.getAuthorities(),
                true,
                clientDetails.getScope(),
                clientDetails.getResourceIds(),
                redirectUri,
                clientDetails.getAuthorizedGrantTypes(),
                new HashMap<>()
        );
        var usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );
        var oAuth2Authentication = new OAuth2Authentication(oAuth2Request, usernamePasswordAuthenticationToken);
        var defaultTokenServices = tokenServicesFactory.createDefaultTokenServices();
        defaultTokenServices.setSupportRefreshToken(true);
        defaultTokenServices.setTokenStore(tokenStore);
        defaultTokenServices.setAccessTokenValiditySeconds(clientDetails.getAccessTokenValiditySeconds());
        defaultTokenServices.setRefreshTokenValiditySeconds(clientDetails.getRefreshTokenValiditySeconds());
        return defaultTokenServices.createAccessToken(oAuth2Authentication);
    }

    private String convertScopeToString(Set<String> scope) {
        var stringBuilder = new StringBuilder();
        var scopeList = new ArrayList<>(scope);

        for (int index = 0; index < scopeList.size(); index++) {
            stringBuilder.append(scopeList.get(index));

            if (index != scopeList.size() - 1) {
                stringBuilder.append(" ");
            }
        }

        return stringBuilder.toString();
    }
}
