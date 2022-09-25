export enum StandardChatRole {
    USER = "USER",
    MODERATOR = "MODERATOR",
    ADMIN = "ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN",
    OWNER = "OWNER"
}

export const isStandardChatRole = (roleName: string): boolean => Object.keys(StandardChatRole).includes(roleName);
