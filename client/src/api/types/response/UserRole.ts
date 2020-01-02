export enum UserRole {
    ROLE_USER = "ROLE_USER",
    ROLE_ADMIN = "ROLE_ADMIN",
    ROLE_ANONYMOUS_USER = "ROLE_ANONYMOUS_USER"
}

export const convertStringToUserRole = (userRole: string, fallBack: UserRole | undefined = UserRole.ROLE_USER): UserRole => {
    switch (userRole.toUpperCase().trim()) {
        case "ROLE_USER":
            return UserRole.ROLE_USER;
        case "ROLE_ADMIN":
            return UserRole.ROLE_ADMIN;
        case "ROLE_ANONYMOUS_USER":
            return UserRole.ROLE_ANONYMOUS_USER;
        default:
            return fallBack;
    }
};
