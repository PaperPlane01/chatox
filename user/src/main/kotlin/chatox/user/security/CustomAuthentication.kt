package chatox.user.security

import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken

class CustomAuthentication(var jwtAuthenticationToken: JwtAuthenticationToken) : Authentication {
    var customUserDetails: CustomUserDetails = CustomUserDetails(jwtAuthenticationToken)
    private var authenticated: Boolean = true

    override fun getAuthorities(): MutableCollection<out GrantedAuthority> {
        return customUserDetails.getAuthorities()
    }

    override fun setAuthenticated(isAuthenticated: Boolean) {
        authenticated = isAuthenticated
    }

    override fun getName(): String {
        return customUserDetails.username
    }

    override fun getCredentials(): Any {
        return customUserDetails
    }

    override fun getPrincipal(): Any {
        return jwtAuthenticationToken
    }

    override fun isAuthenticated(): Boolean {
        return authenticated
    }

    override fun getDetails(): Any {
        return customUserDetails
    }
}
