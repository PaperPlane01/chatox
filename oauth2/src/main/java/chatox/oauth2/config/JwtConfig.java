package chatox.oauth2.config;

import chatox.oauth2.security.token.CustomTokenEnhancer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.oauth2.provider.token.store.JwtAccessTokenConverter;
import org.springframework.security.oauth2.provider.token.store.JwtTokenStore;
import org.springframework.security.oauth2.provider.token.store.KeyStoreKeyFactory;

@Configuration
@PropertySource("classpath:jwt.properties")
public class JwtConfig {
    @Value("${jwt.keystore.location}")
    private String jwtKeyStoreLocation;
    @Value("${jwt.keystore.password}")
    private String jwtKeyStorePassword;
    @Value("${jwt.keystore.alias}")
    private String jwtKeyStoreAlias;

    @Bean
    public JwtAccessTokenConverter jwtAccessTokenConverter() {
        JwtAccessTokenConverter accessTokenConverter = new JwtAccessTokenConverter();
        KeyStoreKeyFactory keyStoreKeyFactory = new KeyStoreKeyFactory(
                new ClassPathResource(jwtKeyStoreLocation),
                jwtKeyStorePassword.toCharArray()
        );
        accessTokenConverter.setKeyPair(keyStoreKeyFactory.getKeyPair(jwtKeyStoreAlias));
        return accessTokenConverter;
    }

    @Bean
    public JwtTokenStore jwtTokenStore() {
        return new JwtTokenStore(jwtAccessTokenConverter());
    }

    @Bean
    public CustomTokenEnhancer customTokenEnhancer() {
        return new CustomTokenEnhancer();
    }
}
