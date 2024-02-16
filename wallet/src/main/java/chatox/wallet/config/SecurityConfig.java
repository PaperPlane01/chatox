package chatox.wallet.config;

import chatox.platform.security.web.AuthenticationHolder;
import chatox.platform.security.web.DefaultAuthenticationHolder;
import chatox.platform.security.web.config.AbstractSecurityConfig;
import chatox.wallet.model.User;
import chatox.wallet.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig extends AbstractSecurityConfig<User> {
    @Autowired
    private UserService userService;

    @Override
    @Bean
    public AuthenticationHolder<User> authenticationHolder() {
        return new DefaultAuthenticationHolder<>(jwtPayload -> userService.findUserById(jwtPayload.getId()));
    }
}
