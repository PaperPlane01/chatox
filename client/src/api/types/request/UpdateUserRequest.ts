export interface UpdateUserRequest {
    firstName: string,
    lastName?: string,
    slug?: string,
    avatarId?: string,
    bio?: string,
    dateOfBirth?: string
}
