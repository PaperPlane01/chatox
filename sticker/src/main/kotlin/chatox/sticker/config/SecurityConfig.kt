package chatox.sticker.config

import chatox.platform.security.jwt.JwtPayload
import chatox.platform.security.reactive.DefaultReactiveAuthenticationHolder
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.platform.security.reactive.config.AbstractReactiveSecurityConfig
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import reactor.core.publisher.Mono

@Configuration
class SecurityConfig : AbstractReactiveSecurityConfig<JwtPayload>() {

    @Bean
    override fun reactiveAuthenticationHolder(): ReactiveAuthenticationHolder<JwtPayload> = DefaultReactiveAuthenticationHolder {
        jwtPayload -> Mono.just(jwtPayload)
    }
}
