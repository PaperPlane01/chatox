export interface JwtPayload {
    user_id: string;
    account_id: string;
    authorities: string[];
    scope: string[];
    user_name: string
}
