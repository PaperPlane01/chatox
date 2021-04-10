package chatox.chat.security

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.*

class CustomUserDetails : UserDetails {
    var id: String
    var accountId: String
    var authorities: MutableList<GrantedAuthority> = mutableListOf()
    private var globalBanId: String?
    private var globalBanExpirationDate: ZonedDateTime? = null
    private var bannedPermanently: Boolean = false
    private var username: String

    constructor(jwtAuthenticationToken: JwtAuthenticationToken) {
        val isClient = jwtAuthenticationToken.token.getClaimAsString("client_id") != null

        id = if (isClient) {
            jwtAuthenticationToken.token.getClaimAsString("client_id")
        } else {
            jwtAuthenticationToken.token.getClaimAsString("user_id")
        }

        accountId = if (isClient) {
            jwtAuthenticationToken.token.getClaimAsString("client_id")
        } else {
            jwtAuthenticationToken.token.getClaimAsString("account_id")
        }

        val _authorities = if (isClient) {
            arrayListOf()
        } else {
            jwtAuthenticationToken.token.getClaimAsStringList("authorities")
                    .map { authority -> SimpleGrantedAuthority(authority) }
        }

        authorities.addAll(jwtAuthenticationToken.token.getClaimAsStringList("scope")
                .map { "SCOPE_$it" }
                .map { SimpleGrantedAuthority(it) }
        )
        authorities.addAll(_authorities)

        username = if (isClient) {
            jwtAuthenticationToken.token.getClaimAsString("client_id")
        } else {
            jwtAuthenticationToken.token.getClaimAsString("user_name")
        }

        globalBanId = jwtAuthenticationToken.token.getClaimAsString("global_ban_id")

        if (globalBanId != null) {
            bannedPermanently = Optional.of(jwtAuthenticationToken.token.getClaimAsBoolean("global_ban_permanent")).orElse(false)

            if (!bannedPermanently) {
                val globalBanExpirationTimestamp = jwtAuthenticationToken.token.getClaim<Long>("global_ban_expiration_date")
                val globalBanInstant = Instant.ofEpochSecond(globalBanExpirationTimestamp)
                globalBanExpirationDate = ZonedDateTime.ofInstant(globalBanInstant, ZoneId.of("UTC"))
            }
        }
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

    fun isAdmin(): Boolean {
        return authorities.stream().anyMatch { authority -> authority.authority == "ROLE_ADMIN"}
    }

    fun isBannedGlobally(): Boolean {
        if (isAdmin()) {
            return false
        }

        return if (globalBanId != null) {
            if (bannedPermanently) {
                true
            } else {
                globalBanExpirationDate!!.isAfter(ZonedDateTime.now())
            }
        } else {
            false
        }
    }
}
