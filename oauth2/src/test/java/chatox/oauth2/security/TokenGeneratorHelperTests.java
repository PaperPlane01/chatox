package chatox.oauth2.security;

import chatox.oauth2.domain.Account;
import chatox.oauth2.domain.Client;
import chatox.oauth2.security.token.TokenGeneratorFactory;
import chatox.oauth2.security.token.TokenGeneratorHelper;
import chatox.oauth2.security.token.TokenPair;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.server.authorization.token.OAuth2AccessTokenGenerator;
import org.springframework.security.oauth2.server.authorization.token.OAuth2RefreshTokenGenerator;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenContext;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.UUID;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class TokenGeneratorHelperTests {
    @Mock
    TokenGeneratorFactory tokenGeneratorFactory;

    @Mock
    OAuth2AccessTokenGenerator oAuth2AccessTokenGenerator;

    @Mock
    OAuth2RefreshTokenGenerator oAuth2RefreshTokenGenerator;

    @InjectMocks
    TokenGeneratorHelper tokenGeneratorHelper;

    @Test
    public void generateTokenPair_generatesTokenPair() {
        // Setup
        var accessTokenString = UUID.randomUUID().toString();
        var accessToken = new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                accessTokenString,
                Instant.now(),
                Instant.now().plus(30, ChronoUnit.MINUTES)
        );
        var refreshTokenString = UUID.randomUUID().toString();
        var refreshToken = new OAuth2RefreshToken(refreshTokenString, Instant.now());

        when(oAuth2AccessTokenGenerator.generate(any(OAuth2TokenContext.class))).thenReturn(accessToken);
        when(oAuth2RefreshTokenGenerator.generate(any(OAuth2TokenContext.class))).thenReturn(refreshToken);

        // Run test
        var account = Account.builder()
                .id("1")
                .roles(Collections.emptyList())
                .build();
        var client = Client.builder()
                .id("1")
                .scope(Collections.emptyList())
                .authorizedGrantTypes(Collections.emptyList())
                .accessTokenValidity(10)
                .refreshTokenValidity(10)
                .build();
        var tokenPair = tokenGeneratorHelper.generateTokenPair(
                new CustomUserDetails(account),
                client.toRegisteredClient()
        );

        // Verify results
        assertEquals(
                tokenPair,
                TokenPair.builder()
                        .accessToken(accessTokenString)
                        .refreshToken(refreshTokenString)
                        .build()
        );
    }
}
