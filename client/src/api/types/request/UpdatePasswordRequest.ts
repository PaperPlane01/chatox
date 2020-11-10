export interface UpdatePasswordRequest {
    currentPassword: string,
    password: string,
    repeatedPassword: string,
    emailConfirmationCodeId?: string,
    emailConfirmationCode?: string
}
