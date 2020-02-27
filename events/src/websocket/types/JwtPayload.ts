export interface JwtPayload {
    account_id: string,
    user_id: string,
    user_name: string,
    scope: string[],
    exp: number,
    authorities: string[],
    jti: string,
    client_id: string
}
