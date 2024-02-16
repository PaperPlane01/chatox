package chatox.user.config

import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.security.reactive.DefaultReactiveAuthenticationHolder
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.platform.security.reactive.config.AbstractReactiveSecurityConfig
import chatox.user.domain.User
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
class SecurityConfig : AbstractReactiveSecurityConfig<User>() {
    @Autowired
    private lateinit var userCacheWrapper: ReactiveRepositoryCacheWrapper<User, String>

    @Bean
    override fun reactiveAuthenticationHolder(): ReactiveAuthenticationHolder<User> = DefaultReactiveAuthenticationHolder {
        jwt -> userCacheWrapper.findById(jwt.id)
    }
}
