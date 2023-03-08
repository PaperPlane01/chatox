package chatox.sticker.security

import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.ReactiveAuthenticationManager
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.jwt.JwtValidationException
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder
import org.springframework.security.oauth2.server.resource.BearerTokenAuthenticationToken
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import reactor.core.publisher.Mono

class CustomJwtReactiveAuthenticationManager(private val jwtDecoder: ReactiveJwtDecoder) : ReactiveAuthenticationManager {

    override fun authenticate(authentication: Authentication?): Mono<Authentication> {
        return Mono.justOrEmpty(authentication)
                .filter { it is BearerTokenAuthenticationToken }
                .cast(BearerTokenAuthenticationToken::class.java)
                .map { jwtDecoder.decode(it.token) }
                .flatMap { it }
                .map { JwtAuthenticationToken(it) }
                .map {
                    val auth = CustomAuthentication(it)
                    return@map auth as Authentication
                }
                .onErrorMap { error ->
                    if (error is JwtValidationException) {
                        return@onErrorMap BadCredentialsException("JWT is invalid")
                    } else {
                        return@onErrorMap error
                    }
                }
    }

}
