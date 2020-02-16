export interface User {
    id: string,
    firstName: string,
    lastName?: string,
    slug?: string,
    avatarUri?: string,
    deleted: boolean
}
