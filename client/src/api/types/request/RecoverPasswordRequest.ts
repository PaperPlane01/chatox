export interface RecoverPasswordRequest {
    emailConfirmationCodeId: string,
    emailConfirmationCode: string,
    password: string,
    repeatedPassword: string
}
