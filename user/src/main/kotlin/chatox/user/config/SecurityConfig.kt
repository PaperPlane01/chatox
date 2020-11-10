package chatox.user.config

import chatox.user.security.CustomJwtReactiveAuthenticationManager
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity
import org.springframework.security.config.web.server.ServerHttpSecurity
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder
import org.springframework.security.web.server.SecurityWebFilterChain
import java.security.KeyFactory
import java.security.interfaces.RSAPublicKey
import java.security.spec.X509EncodedKeySpec
import java.util.Base64

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
class SecurityConfig {
    @Value("\${jwt.public.key}")
    private lateinit var jwtPublicKey: String

    @Bean
    fun springSecurityFilterChain(http: ServerHttpSecurity): SecurityWebFilterChain {
        http.authorizeExchange()
                .pathMatchers("/**").permitAll()
                .and()
                .oauth2ResourceServer()
                .jwt()
                .jwtDecoder(reactiveJwtDecoder())
                .authenticationManager(CustomJwtReactiveAuthenticationManager(reactiveJwtDecoder()))
        return http.build()
    }

    @Bean
    fun reactiveJwtDecoder(): ReactiveJwtDecoder {
        return NimbusReactiveJwtDecoder.withPublicKey(rsaPublicKey()).build()
    }

    fun rsaPublicKey(): RSAPublicKey {
        val publicKey = jwtPublicKey.replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replace("\n", "")
                .replace("\r", "")
        val decoded = Base64.getDecoder().decode(publicKey)
        val keyFactory = KeyFactory.getInstance("RSA")
        val rsaPublicKey = keyFactory.generatePublic(X509EncodedKeySpec(decoded))
        return rsaPublicKey as RSAPublicKey
    }
}
