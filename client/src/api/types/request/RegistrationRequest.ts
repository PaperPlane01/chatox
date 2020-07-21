export interface RegistrationRequest {
    username: string,
    password: string,
    repeatedPassword: string,
    firstName: string,
    lastName?: string,
    clientId: string,
    email?: string,
    emailVerificationId?: string,
    emailVerificationConfirmationCode?: string
}
