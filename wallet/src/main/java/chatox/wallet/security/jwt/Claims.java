package chatox.wallet.security.jwt;

interface Claims {
    String ACCOUNT_ID = "account_id";
    String USER_ID = "user_id";
    String CLIENT_ID = "client_id";
    String AUTHORITIES = "authorities";
    String SCOPE = "scope";
    String USERNAME = "user_name";
    String EMAIL = "email";
    String GLOBAL_BAN_ID = "global_ban_id";
    String GLOBAL_BAN_EXPIRATION_DATE = "global_ban_expiration_date";
    String GLOBAL_BAN_PERMANENT = "global_ban_permanent";
}
