package chatox.chat.config

import chatox.chat.model.User
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.security.reactive.DefaultReactiveAuthenticationHolder
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.platform.security.reactive.config.AbstractReactiveSecurityConfig
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
    private lateinit var userCache: ReactiveRepositoryCacheWrapper<User, String>

    @Bean
    override fun reactiveAuthenticationHolder(): ReactiveAuthenticationHolder<User> = DefaultReactiveAuthenticationHolder {
        jwt -> userCache.findById(jwt.id)
    }
}
