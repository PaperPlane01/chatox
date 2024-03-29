export interface UserEntity {
    id: string,
    firstName: string,
    lastName?: string,
    bio?: string,
    dateOfBirth?: Date,
    slug?: string,
    externalAvatarUri?: string,
    deleted: boolean,
    createdAt: Date,
    online: boolean,
    lastSeen?: Date,
    avatarId?: string,
    onlineStatusMightBeInaccurate?: boolean
}
