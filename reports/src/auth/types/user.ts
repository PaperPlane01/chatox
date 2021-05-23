import {UserRole} from "./user-role";

export interface User {
    id: string;
    accountId: string;
    roles: UserRole[];
    scope: string[];
    userName: string
}
