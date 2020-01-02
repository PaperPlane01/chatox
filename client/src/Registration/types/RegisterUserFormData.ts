export interface RegisterUserFormData {
    username: string,
    password: string,
    repeatedPassword: string,
    firstName: string,
    lastName?: string,
    slug?: string
}
