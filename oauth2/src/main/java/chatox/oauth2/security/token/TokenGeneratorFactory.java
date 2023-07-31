package chatox.oauth2.security.token;

import org.springframework.security.oauth2.server.authorization.token.OAuth2AccessTokenGenerator;
import org.springframework.security.oauth2.server.authorization.token.OAuth2RefreshTokenGenerator;
import org.springframework.stereotype.Component;

@Component
public class TokenGeneratorFactory {

    public OAuth2AccessTokenGenerator accessTokenGenerator() {
        return new OAuth2AccessTokenGenerator();
    }

    public OAuth2RefreshTokenGenerator refreshTokenGenerator() {
        return new OAuth2RefreshTokenGenerator();
    }
}
