package chatox.oauth2.security.token;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.server.authorization.token.JwtGenerator;
import org.springframework.security.oauth2.server.authorization.token.OAuth2AccessTokenGenerator;
import org.springframework.security.oauth2.server.authorization.token.OAuth2RefreshTokenGenerator;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TokenGeneratorFactory {
    private final JwtEncoder jwtEncoder;
    private final JwtCustomizer jwtCustomizer;

    public OAuth2AccessTokenGenerator accessTokenGenerator() {
        return new OAuth2AccessTokenGenerator();
    }

    public OAuth2RefreshTokenGenerator refreshTokenGenerator() {
        return new OAuth2RefreshTokenGenerator();
    }

    public JwtGenerator jwtGenerator() {
        var jwtGenerator = new JwtGenerator(jwtEncoder);
        jwtGenerator.setJwtCustomizer(jwtCustomizer);
        return jwtGenerator;
    }
}
