package chatox.oauth2.controller;

import chatox.oauth2.api.request.ExchangeTokenRequest;
import chatox.oauth2.api.response.ExchangeTokenResponse;
import chatox.oauth2.exception.InvalidAccessTokenException;
import chatox.oauth2.security.token.TokenGeneratorHelper;
import chatox.oauth2.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.security.oauth2.server.authorization.token.JwtGenerator;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.temporal.ChronoUnit;

@RestController
@RequiredArgsConstructor
public class TokenExchangeController {
    private final JdbcOAuth2AuthorizationService oAuth2AuthorizationService;
    private final JwtGenerator jwtGenerator;
    private final AccountService accountService;
    private final TokenGeneratorHelper tokenGeneratorHelper;

    @PostMapping("/oauth/exchangeToken")
    public ExchangeTokenResponse exchangeToken(@RequestBody @Valid ExchangeTokenRequest exchangeTokenRequest) {
        var accessToken = oAuth2AuthorizationService.findByToken(
                exchangeTokenRequest.getAccessToken(),
                OAuth2TokenType.ACCESS_TOKEN
        );

        if (accessToken == null) {
            throw new InvalidAccessTokenException("Access token is either invalid or expired");
        }

        var client = createStubRegisteredClient(accessToken);
        var user = accountService.loadUserByUsername(accessToken.getPrincipalName());

        var context = tokenGeneratorHelper.createContext(
                OAuth2TokenType.ACCESS_TOKEN,
                client,
                user
        );

        var jwt = jwtGenerator.generate(context);

        if (jwt == null) {
            throw new InvalidAccessTokenException("Access token is either invalid or expired");
        }

        return ExchangeTokenResponse.builder()
                .jwt(jwt.getTokenValue())
                .build();
    }

    private RegisteredClient createStubRegisteredClient(OAuth2Authorization accessToken) {
        var registeredClient = RegisteredClient
                .withId(accessToken.getRegisteredClientId())
                .clientId(accessToken.getRegisteredClientId())
                .authorizationGrantType(AuthorizationGrantType.JWT_BEARER)
                .tokenSettings(TokenSettings.builder()
                .accessTokenTimeToLive(Duration.of(900, ChronoUnit.SECONDS))
                .build());
        return registeredClient.build();
    }

}
