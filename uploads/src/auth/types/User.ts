import {UserRole} from "./UserRole";

export interface User {
    id: string,
    roles: UserRole[],
    scope: string[]
    accountId: string,
    username: string
}
