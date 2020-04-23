export interface CurrentUser {
    id: string,
    roles: string[],
    scope: string[]
    accountId: string,
    username: string
}
