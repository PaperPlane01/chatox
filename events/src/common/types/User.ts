export interface User {
    id: string,
    firstName: string,
    lastName?: string,
    slug?: string,
    avatarUri?: string,
    deleted: boolean,
    createdAt: string,
    dateOfBirth?: string,
    bio?: string
}
