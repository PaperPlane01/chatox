package chatox.user.security

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken

class CustomUserDetails : UserDetails {
    var id: String
    var accountId: String
    var authorities: MutableList<GrantedAuthority> = mutableListOf()
    var email: String? = null
    private var username: String

    constructor(jwtAuthenticationToken: JwtAuthenticationToken) {
        id = if (jwtAuthenticationToken.token.getClaimAsString("user_id") != null) {
            jwtAuthenticationToken.token.getClaimAsString("user_id")
        } else {
            jwtAuthenticationToken.token.getClaimAsString("client_id")
        }

        accountId = if (jwtAuthenticationToken.token.getClaimAsString("account_id") != null) {
            jwtAuthenticationToken.token.getClaimAsString("account_id")
        } else {
            jwtAuthenticationToken.token.getClaimAsString("client_id")
        }
        val _authorities = if (jwtAuthenticationToken.token.getClaimAsStringList("authorities") != null) {
            jwtAuthenticationToken.token.getClaimAsStringList("authorities")
                    .map { authority -> SimpleGrantedAuthority(authority) }
        } else {
            arrayListOf()
        }

        authorities.addAll(jwtAuthenticationToken.token.getClaimAsStringList("scope")
                .map { "SCOPE_$it" }
                .map { SimpleGrantedAuthority(it) }
        )
        authorities.addAll(_authorities)
        username = if (jwtAuthenticationToken.token.getClaimAsString("user_name") != null) {
            jwtAuthenticationToken.token.getClaimAsString("user_name")
        } else {
            jwtAuthenticationToken.token.getClaimAsString("client_id")
        }
        email = jwtAuthenticationToken.token.getClaimAsString("email")
    }

    override fun getAuthorities(): MutableCollection<out GrantedAuthority> {
        return authorities
    }

    override fun isEnabled(): Boolean {
        return true
    }

    override fun getUsername(): String {
        return username
    }

    override fun isCredentialsNonExpired(): Boolean {
        return true
    }

    override fun getPassword(): String {
        return ""
    }

    override fun isAccountNonExpired(): Boolean {
        return true
    }

    override fun isAccountNonLocked(): Boolean {
        return true
    }
}
