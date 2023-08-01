package chatox.oauth2.config;

import chatox.oauth2.security.password.PasswordGrantAuthenticationProvider;
import chatox.oauth2.security.password.PasswordGrantAuthorizationConverter;
import chatox.oauth2.security.token.TokenGeneratorHelper;
import chatox.oauth2.service.AccountService;
import chatox.oauth2.service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.web.SecurityFilterChain;

import javax.sql.DataSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    @Autowired
    private AuthenticationConfiguration authenticationConfiguration;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager customAuthenticationManager() {
        try {
            return authenticationConfiguration.getAuthenticationManager();
        } catch (Exception exception) {
            throw new RuntimeException(exception);
        }
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           AuthenticationManager authenticationManager,
                                           PasswordGrantAuthenticationProvider passwordGrantAuthenticationProvider,
                                           PasswordGrantAuthorizationConverter passwordGrantAuthorizationConverter) throws Exception {
        var authorizationServerConfigurer =
                new OAuth2AuthorizationServerConfigurer();
        authorizationServerConfigurer.tokenEndpoint(tokenEndpoint -> {
            tokenEndpoint.authenticationProviders(providers -> providers.add(passwordGrantAuthenticationProvider));
            tokenEndpoint.accessTokenRequestConverters(converters -> converters.add(passwordGrantAuthorizationConverter));
        });
        http.apply(authorizationServerConfigurer);

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
    @Autowired
    public static JdbcOAuth2AuthorizationService oAuth2AuthorizationService(
            JdbcTemplate jdbcTemplate,
            ClientService clientService) {
        return new JdbcOAuth2AuthorizationService(jdbcTemplate, clientService);
    }

    @Bean
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    @Bean
    public PasswordGrantAuthenticationProvider passwordGrantAuthenticationProvider(
            AccountService accountService,
            ClientService clientService,
            TokenGeneratorHelper tokenGeneratorHelper,
            JdbcOAuth2AuthorizationService jdbcOAuth2AuthorizationService,
            PasswordEncoder passwordEncoder) {
        return new PasswordGrantAuthenticationProvider(
                accountService,
                clientService,
                tokenGeneratorHelper,
                jdbcOAuth2AuthorizationService,
                passwordEncoder
        );
    }

    @Bean
    public PasswordGrantAuthorizationConverter passwordGrantAuthorizationConverter() {
        return new PasswordGrantAuthorizationConverter();
    }
}
