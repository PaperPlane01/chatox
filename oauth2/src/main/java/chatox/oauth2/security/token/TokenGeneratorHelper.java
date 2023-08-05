package chatox.oauth2.security.token;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.context.AuthorizationServerContext;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.token.DefaultOAuth2TokenContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenContext;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TokenGeneratorHelper {
    private final TokenGeneratorFactory tokenGeneratorFactory;

    public TokenPair generateTokenPair(UserDetails userDetails, RegisteredClient registeredClient) {
        var accessToken = createToken(userDetails, registeredClient);

        return TokenPair.builder()
                .accessToken(accessToken.getAccessToken().getToken().getTokenValue())
                .refreshToken(accessToken.getRefreshToken() != null
                        ? accessToken.getRefreshToken().getToken().getTokenValue()
                        : null
                )
                .build();
    }

    public OAuth2Authorization createToken(UserDetails userDetails, RegisteredClient registeredClient) {
        var accessToken = tokenGeneratorFactory.accessTokenGenerator().generate(createContext(
                OAuth2TokenType.ACCESS_TOKEN,
                registeredClient,
                userDetails
        ));

        OAuth2RefreshToken refreshToken = null;

        if (registeredClient.getAuthorizationGrantTypes().contains(AuthorizationGrantType.REFRESH_TOKEN)) {
            refreshToken = tokenGeneratorFactory.refreshTokenGenerator().generate(createContext(
                    OAuth2TokenType.REFRESH_TOKEN,
                    registeredClient,
                    userDetails
            ));
        }

        return OAuth2Authorization
                .withRegisteredClient(registeredClient)
                .accessToken(new OAuth2AccessToken(
                        accessToken.getTokenType(),
                        accessToken.getTokenValue(),
                        accessToken.getIssuedAt(),
                        accessToken.getExpiresAt(),
                        accessToken.getScopes()
                ))
                .refreshToken(refreshToken)
                .principalName(userDetails.getUsername())
                .authorizedScopes(registeredClient.getScopes())
                .authorizationGrantType(AuthorizationGrantType.PASSWORD)
                .build();
    }

    public OAuth2TokenContext createContext(OAuth2TokenType tokenType, RegisteredClient registeredClient) {
        return DefaultOAuth2TokenContext.builder()
                .registeredClient(registeredClient)
                .authorizedScopes(registeredClient.getScopes())
                .tokenType(tokenType)
                .principal(new UsernamePasswordAuthenticationToken(
                        registeredClient.getClientId(),
                        null
                ))
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                .authorizationServerContext(ChatoxAuthorizationServiceContext.INSTANCE)
                .build();
    }

    public OAuth2TokenContext createContext(OAuth2TokenType tokenType, RegisteredClient registeredClient, UserDetails userDetails) {
        return DefaultOAuth2TokenContext.builder()
                .registeredClient(registeredClient)
                .authorizedScopes(registeredClient.getScopes())
                .tokenType(tokenType)
                .principal(new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                ))
                .authorizationGrantType(AuthorizationGrantType.PASSWORD)
                .authorizationServerContext(ChatoxAuthorizationServiceContext.INSTANCE)
                .build();
    }

    private static class ChatoxAuthorizationServiceContext implements AuthorizationServerContext {
        private static final ChatoxAuthorizationServiceContext INSTANCE = new ChatoxAuthorizationServiceContext();

        private ChatoxAuthorizationServiceContext() {
        }

        @Override
        public String getIssuer() {
            return "chatox-oauth2-service";
        }

        @Override
        public AuthorizationServerSettings getAuthorizationServerSettings() {
            return null;
        }
    }
}
