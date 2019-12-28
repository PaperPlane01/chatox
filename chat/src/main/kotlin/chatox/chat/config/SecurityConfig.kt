package chatox.chat.config

import chatox.chat.security.CustomJwtReactiveAuthenticationManager
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.io.ClassPathResource
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity
import org.springframework.security.config.web.server.ServerHttpSecurity
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder
import org.springframework.security.web.server.SecurityWebFilterChain
import java.nio.file.Files
import java.security.KeyFactory
import java.security.interfaces.RSAPublicKey
import java.security.spec.X509EncodedKeySpec
import java.util.Base64

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
class SecurityConfig {
    @Value("\${jwt.public.key.location}")
    private lateinit var publicKeyLocation: String

    @Bean
    fun springSecurityFilterChain(http: ServerHttpSecurity): SecurityWebFilterChain {
        http.csrf().disable()
                .authorizeExchange()
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
        println(publicKeyLocation)
        val classPathResource = ClassPathResource(publicKeyLocation)
        var publicKey = Files.readString(classPathResource.file.toPath())
        publicKey = publicKey.replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replace("\n", "")
                .replace("\r", "")
        val decoded = Base64.getDecoder().decode(publicKey)
        val keyFactory = KeyFactory.getInstance("RSA")
        val rsaPublicKey = keyFactory.generatePublic(X509EncodedKeySpec(decoded))
        println(rsaPublicKey is RSAPublicKey)
        return rsaPublicKey as RSAPublicKey
    }
}
