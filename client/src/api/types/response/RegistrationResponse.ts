import {UserRole} from "./UserRole";

export interface RegistrationResponse {
    userId: string,
    roles: UserRole[],
    accessToken: string,
    refreshToken: string,
    firstName: string,
    lastName?: string,
    slug?: string,
    avatarUri?: string,
    accountId: string,
    createdAt: string
}
