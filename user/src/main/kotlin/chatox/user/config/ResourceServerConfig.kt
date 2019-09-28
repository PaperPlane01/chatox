package chatox.user.config

import org.apache.commons.io.IOUtils
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.io.ClassPathResource
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter
import org.springframework.security.oauth2.provider.token.store.JwtAccessTokenConverter
import org.springframework.security.oauth2.provider.token.store.JwtTokenStore
import java.nio.charset.StandardCharsets

@Configuration
@EnableResourceServer
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
class ResourceServerConfig : ResourceServerConfigurerAdapter() {
    @Value("\${jwt.public.key.location}")
    private lateinit var jwtPublicKeyLocation: String

    override fun configure(http: HttpSecurity?) {
        http!!.csrf().disable()
                .authorizeRequests()
                .antMatchers("/**").permitAll()
    }

    @Bean
    fun tokenStore() = JwtTokenStore(jwtAccessTokenConverter())

    @Bean
    fun jwtAccessTokenConverter(): JwtAccessTokenConverter {
        val converter = JwtAccessTokenConverter()

        val resource = ClassPathResource(jwtPublicKeyLocation)

        converter.setVerifierKey(IOUtils.toString(resource.inputStream, StandardCharsets.UTF_8))

        return converter
    }
}
