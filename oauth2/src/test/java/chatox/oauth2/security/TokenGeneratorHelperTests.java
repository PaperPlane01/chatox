package chatox.oauth2.security;

import chatox.oauth2.domain.Account;
import chatox.oauth2.domain.Client;
import chatox.oauth2.security.token.TokenGeneratorHelper;
import chatox.oauth2.security.token.TokenPair;
import chatox.oauth2.security.token.TokenServicesFactory;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.security.oauth2.common.DefaultOAuth2AccessToken;
import org.springframework.security.oauth2.common.DefaultOAuth2RefreshToken;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.token.DefaultTokenServices;

import java.util.Collections;
import java.util.UUID;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class TokenGeneratorHelperTests {
    @Mock
    TokenServicesFactory tokenServicesFactory;

    @Mock
    DefaultTokenServices defaultTokenServices;

    @InjectMocks
    TokenGeneratorHelper tokenGeneratorHelper;

    @Test
    public void generateTokenPair_generatesTokenPair() {
        // Setup
        var accessTokenString = UUID.randomUUID().toString();
        var accessToken = new DefaultOAuth2AccessToken(accessTokenString);
        var refreshTokenString = UUID.randomUUID().toString();
        var refreshToken = new DefaultOAuth2RefreshToken(refreshTokenString);
        accessToken.setRefreshToken(refreshToken);
        when(defaultTokenServices.createAccessToken(any(OAuth2Authentication.class))).thenReturn(accessToken);
        when(tokenServicesFactory.createDefaultTokenServices()).thenReturn(defaultTokenServices);

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
                new CustomClientDetails(client)
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
