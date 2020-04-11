import {UserRole} from "./UserRole";

export interface CurrentUser {
    id: string,
    slug?: string,
    bio?: string,
    firstName: string,
    lastName?: string,
    avatarUri?: string,
    accountId: string,
    roles: UserRole[],
    createdAt: string
}
