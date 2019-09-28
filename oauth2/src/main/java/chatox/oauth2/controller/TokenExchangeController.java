package chatox.oauth2.controller;

import chatox.oauth2.api.request.ExchangeTokenRequest;
import chatox.oauth2.api.response.ExchangeTokenResponse;
import chatox.oauth2.security.token.CustomTokenEnhancer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.token.DefaultTokenServices;
import org.springframework.security.oauth2.provider.token.TokenEnhancerChain;
import org.springframework.security.oauth2.provider.token.TokenStore;
import org.springframework.security.oauth2.provider.token.store.JwtAccessTokenConverter;
import org.springframework.security.oauth2.provider.token.store.JwtTokenStore;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.Arrays;

@RestController
@RequiredArgsConstructor
public class TokenExchangeController {
    private final TokenStore tokenStore;
    private final JwtAccessTokenConverter jwtAccessTokenConverter;
    private final JwtTokenStore jwtTokenStore;
    private final CustomTokenEnhancer customTokenEnhancer;

    @PostMapping("/oauth/exchangeToken")
    public ExchangeTokenResponse exchangeToken(@RequestBody @Valid ExchangeTokenRequest exchangeTokenRequest) {
        DefaultTokenServices defaultTokenServices = new DefaultTokenServices();
        defaultTokenServices.setTokenStore(tokenStore);
        OAuth2Authentication oAuth2Authentication = defaultTokenServices.loadAuthentication(exchangeTokenRequest.getAccessToken());

        System.out.println(oAuth2Authentication);

        TokenEnhancerChain tokenEnhancerChain = new TokenEnhancerChain();
        tokenEnhancerChain.setTokenEnhancers(Arrays.asList(customTokenEnhancer, jwtAccessTokenConverter));

        DefaultTokenServices jwtTokenServices = new DefaultTokenServices();
        jwtTokenServices.setTokenStore(jwtTokenStore);
        jwtTokenServices.setTokenEnhancer(tokenEnhancerChain);
        jwtTokenServices.setAccessTokenValiditySeconds(900);

        OAuth2AccessToken oAuth2AccessToken = jwtTokenServices.createAccessToken(oAuth2Authentication);
        return ExchangeTokenResponse.builder().jwt(oAuth2AccessToken.getValue()).build();
    }
}
