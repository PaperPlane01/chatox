package chatox.platform.security.jwt;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum AccessTokenClaims {
    ACCOUNT_ID("account_Id"),
    USER_ID("user_id"),
    CLIENT_ID("client_id"),
    AUTHORITIES("authorities"),
    SCOPE("scope"),
    USERNAME("username"),
    EMAIL("email"),
    GLOBAL_BAN_ID("global_ban_id"),
    GLOBAL_BAN_EXPIRATION_DATE("global_ban_expiration_date"),
    GLOBAL_BAN_PERMANENT("global_ban_permanent");

    private final String value;
}
