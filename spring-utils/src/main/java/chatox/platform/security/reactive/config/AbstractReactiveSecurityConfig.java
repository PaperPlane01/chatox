package chatox.platform.security.reactive.config;

import chatox.platform.security.config.JwtProperties;
import chatox.platform.security.reactive.ChatoxReactiveAuthenticationManager;
import chatox.platform.security.reactive.ReactiveAuthenticationHolder;
import chatox.platform.security.reactive.interceptor.ReactivePermissionEvaluator;
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

public abstract class AbstractReactiveSecurityConfig<U> {
    @Autowired
    protected JwtProperties jwtProperties;

    @Bean
    public ReactivePermissionEvaluator reactivePermissionEvaluator() {
        return new ReactivePermissionEvaluator();
    }

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http,
                                                            ReactiveJwtDecoder jwtDecoder,
                                                            ChatoxReactiveAuthenticationManager authenticationManager) {
        http
                .authorizeExchange(authorize -> authorize.pathMatchers("/**").permitAll())
                .csrf(csrf -> csrf.disable())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> {
                    jwt.authenticationManager(authenticationManager);
                    jwt.jwtDecoder(jwtDecoder);
                }));
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

    public abstract ReactiveAuthenticationHolder<U> reactiveAuthenticationHolder();
}
