export interface UserEntity {
    id: string,
    firstName: string,
    lastName?: string,
    bio?: string,
    dateOfBirth?: Date | string,
    slug?: string,
    externalAvatarUri?: string,
    deleted: boolean,
    createdAt: Date | string,
    online: boolean,
    lastSeen?: Date | string,
    avatarId?: string,
    onlineStatusMightBeInaccurate?: boolean
}
