export interface UpdateEmailRequest {
    oldEmail?: string,
    changeEmailConfirmationCodeId?: string,
    changeEmailConfirmationCode?: string,
    newEmail: string,
    newEmailConfirmationCodeId: string,
    newEmailConfirmationCode: string
}