package chatox.oauth2.config;

import chatox.oauth2.security.token.JwtCustomizer;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.authorization.token.JwtGenerator;
import org.springframework.security.rsa.crypto.KeyStoreKeyFactory;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.UUID;

@Configuration
@PropertySource("classpath:jwt.properties")
public class JwtConfig {
    @Value("${jwt.keystore.location}")
    private String jwtKeyStoreLocation;
    @Value("${jwt.keystore.password}")
    private String jwtKeyStorePassword;
    @Value("${jwt.keystore.alias}")
    private String jwtKeyStoreAlias;

    @Autowired
    private JwtCustomizer jwtCustomizer;

    @Bean
    public JwtEncoder jwtEncoder(JWKSource<SecurityContext> jwkSource) {
        return new NimbusJwtEncoder(jwkSource);
    }

    @Bean
    public JWKSource<SecurityContext> jwkSource(KeyStoreKeyFactory keyStoreKeyFactory) {
        var keyPair = keyStoreKeyFactory.getKeyPair(jwtKeyStoreAlias);
        var publicKey = (RSAPublicKey) keyPair.getPublic();
        var privateKey = (RSAPrivateKey) keyPair.getPrivate();
        var rsaKey = new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID(UUID.randomUUID().toString())
                .build();
        var jwkSet = new JWKSet(rsaKey);

        return new ImmutableJWKSet<>(jwkSet);
    }

    @Bean
    public KeyStoreKeyFactory keyStore() {
        return new KeyStoreKeyFactory(
                new ClassPathResource(jwtKeyStoreLocation),
                jwtKeyStorePassword.toCharArray()
        );
    }

    @Bean
    public JwtGenerator jwtGenerator(JwtEncoder jwtEncoder) {
        var jwtGenerator = new JwtGenerator(jwtEncoder);
        jwtGenerator.setJwtCustomizer(jwtCustomizer);
        return jwtGenerator;
    }
}
