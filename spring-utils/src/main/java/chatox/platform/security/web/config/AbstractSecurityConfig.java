package chatox.platform.security.web.config;

import chatox.platform.security.config.JwtProperties;
import chatox.platform.security.web.AuthenticationHolder;
import chatox.platform.security.web.ChatoxAuthenticationManager;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public abstract class AbstractSecurityConfig<U> {
    @Autowired
    private JwtProperties jwtProperties;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           AuthenticationManager authenticationManager) throws Exception {
        http
                .authorizeHttpRequests(authorize -> authorize.requestMatchers("/**").permitAll())
                .csrf(csrf -> csrf.disable())
                .oauth2ResourceServer(
                        oauth2 ->
                                oauth2.jwt(jwt -> jwt.authenticationManager(authenticationManager))
                );
        return http.build();
    }

    @Bean
    public AuthenticationManager customAuthenticationManager(JwtDecoder jwtDecoder) {
        return new ChatoxAuthenticationManager(jwtDecoder);
    }

    @Bean
    public JwtDecoder jwtDecoder(RSAPublicKey publicKey) {
        return NimbusJwtDecoder.withPublicKey(publicKey).build();
    }

    @Bean
    @SneakyThrows
    public RSAPublicKey publicKey(KeyFactory keyFactory) {
        var publicKey = jwtProperties.getPublicKey()
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replace("\\n", "")
                .replace("\\r", "");
        var decoded = Base64.getDecoder().decode(publicKey);
        var rsaPublicKey = keyFactory.generatePublic(new X509EncodedKeySpec(decoded));
        return (RSAPublicKey) rsaPublicKey;
    }

    @Bean
    @SneakyThrows
    public KeyFactory rsaKeyFactory() {
        return KeyFactory.getInstance("RSA");
    }

    public abstract AuthenticationHolder<U> authenticationHolder();
}
