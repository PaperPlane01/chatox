export interface User {
    id: string,
    firstName: string,
    lastName?: string,
    bio?: string,
    dateOfBirth?: string,
    slug?: string,
    avatarUri?: string,
    deleted: boolean
}
