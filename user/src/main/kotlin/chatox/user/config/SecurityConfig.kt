package chatox.user.config

import chatox.platform.cache.ReactiveCacheService
import chatox.platform.security.reactive.DefaultReactiveAuthenticationHolder
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.platform.security.reactive.config.AbstractReactiveSecurityConfig
import chatox.user.domain.User
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
class SecurityConfig : AbstractReactiveSecurityConfig<User>() {
    @Autowired
    @Qualifier(value = RedisConfig.USER_BY_ID_CACHE)
    private lateinit var userCache: ReactiveCacheService<User, String>

    @Bean
    override fun reactiveAuthenticationHolder(): ReactiveAuthenticationHolder<User> = DefaultReactiveAuthenticationHolder {
        jwt -> userCache.find(jwt.id)
    }
}
