import {CurrentUser, UserRole} from "../../api/types/response";

export const canBanUsersGlobally = (user?: CurrentUser): boolean => {
    if (!user) {
        return false;
    }

    return user.roles.includes(UserRole.ROLE_ADMIN);
}