package chatox.platform.security.reactive.config;

import chatox.platform.security.reactive.ChatoxReactiveAuthenticationManager;
import chatox.platform.security.reactive.ReactiveAuthenticationHolder;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.web.server.SecurityWebFilterChain;

import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public abstract class AbstractReactiveSecurityConfig<UserClass> {
    @Autowired
    protected JwtProperties jwtProperties;

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http,
                                                            ReactiveJwtDecoder jwtDecoder,
                                                            ChatoxReactiveAuthenticationManager authenticationManager) {
        http.csrf().disable()
                .authorizeExchange()
                .pathMatchers("/**").permitAll()
                .and()
                .oauth2ResourceServer()
                .jwt()
                .jwtDecoder(jwtDecoder)
                .authenticationManager(authenticationManager);
        return http.build();
    }

    @Bean
    public ReactiveJwtDecoder reactiveJwtDecoder(RSAPublicKey rsaPublicKey) {
        return NimbusReactiveJwtDecoder.withPublicKey(rsaPublicKey).build();
    }

    @Bean
    @SneakyThrows
    public RSAPublicKey rsaPublicKey() {
        var key = jwtProperties.getPublicKey()
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY----", "")
                .replace("\n", "")
                .replace("\r", "");
        var decodedKey = Base64.getDecoder().decode(key);
        var keyFactory = KeyFactory.getInstance("RSA");

        return (RSAPublicKey) keyFactory.generatePublic(new X509EncodedKeySpec(decodedKey));
    }

    @Bean
    public ChatoxReactiveAuthenticationManager authenticationManager(ReactiveJwtDecoder jwtDecoder) {
        return new ChatoxReactiveAuthenticationManager(jwtDecoder);
    }

    public abstract ReactiveAuthenticationHolder<UserClass> reactiveAuthenticationHolder();
}
