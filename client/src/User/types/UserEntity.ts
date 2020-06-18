export interface UserEntity {
    id: string,
    firstName: string,
    lastName?: string,
    bio?: string,
    dateOfBirth?: Date,
    slug?: string,
    avatarUri?: string,
    deleted: boolean,
    createdAt: Date,
    online: boolean
}
