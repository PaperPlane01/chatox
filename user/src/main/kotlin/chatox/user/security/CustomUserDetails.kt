package chatox.user.security

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken

class CustomUserDetails : UserDetails {
    var id: String
    var accountId: String
    var authorities: MutableList<GrantedAuthority> = mutableListOf()
    private var username: String

    constructor(jwtAuthenticationToken: JwtAuthenticationToken) {
        id = jwtAuthenticationToken.token.getClaimAsString("user_id")
        accountId = jwtAuthenticationToken.token.getClaimAsString("account_id")
        val _authorities = jwtAuthenticationToken.token.getClaimAsStringList("authorities")
                .map { authority -> SimpleGrantedAuthority(authority) }
        authorities.addAll(jwtAuthenticationToken.token.getClaimAsStringList("scope")
                .map { "SCOPE_$it" }
                .map { SimpleGrantedAuthority(it) }
        )
        authorities.addAll(_authorities)
        username = jwtAuthenticationToken.token.getClaimAsString("user_name")
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
