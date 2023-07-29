package chatox.wallet.config;

import chatox.wallet.config.property.JwtConfigProperties;
import chatox.wallet.exception.InternalServerErrorException;
import chatox.wallet.exception.UserNotFoundException;
import chatox.wallet.model.User;
import chatox.wallet.security.AuthenticationHolder;
import chatox.wallet.security.CustomAuthenticationManager;
import chatox.wallet.security.DefaultAuthenticationHolder;
import chatox.wallet.security.jwt.JwtPayload;
import chatox.wallet.service.UserService;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Optional;
import java.util.function.Function;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    @Autowired
    private JwtConfigProperties jwtConfigurationProperties;

    @Autowired
    private UserService userService;

    static {
        java.security.Security.addProvider(
                new org.bouncycastle.jce.provider.BouncyCastleProvider()
        );
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           AuthenticationManager authenticationManager) throws Exception {
        http
                .authorizeHttpRequests(authorize -> authorize.requestMatchers("/**").permitAll())
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))
                .oauth2ResourceServer(
                        oauth2 ->
                                oauth2.jwt(jwt -> jwt.authenticationManager(authenticationManager))
                );
        return http.build();
    }

    @Bean
    public AuthenticationManager customAuthenticationManager(JwtDecoder jwtDecoder) {
        return new CustomAuthenticationManager(jwtDecoder);
    }

    @Bean
    public JwtDecoder jwtDecoder(RSAPublicKey publicKey) {
        return NimbusJwtDecoder.withPublicKey(publicKey).build();
    }

    @Bean
    @SneakyThrows
    public RSAPublicKey publicKey(KeyFactory keyFactory) {
        var publicKey = jwtConfigurationProperties.getPublicKey()
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

    @Bean
    public AuthenticationHolder<User> authenticationHolder() {
        return new DefaultAuthenticationHolder<>(userProvider());
    }

    private Function<JwtPayload, Optional<User>> userProvider() {
        return jwtPayload -> {
            try {
                var user = userService.findUserById(jwtPayload.getId());
                return Optional.of(user);
            } catch (UserNotFoundException userNotFoundException) {
                return Optional.empty();
            }
        };
    }
}
