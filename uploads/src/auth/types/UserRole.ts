export type UserRole = "ROLE_USER" | "ROLE_ADMIN" | "ROLE_ANONYMOUS_USER";

const ROLES = ["ROLE_USER", "ROLE_ANONYMOUS_USER", "ROLE_ADMIN"];

export const isUserRole = (role: string): role is UserRole => {
    return ROLES.includes(role);
};
