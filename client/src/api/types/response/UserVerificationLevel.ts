export enum UserVerificationLevel {
    ANONYMOUS = "ANONYMOUS",
    REGISTERED = "REGISTERED",
    EMAIL_VERIFIED = "EMAIL_VERIFIED"
}

export const USER_VERIFICATION_LEVELS = [
    UserVerificationLevel.ANONYMOUS,
    UserVerificationLevel.REGISTERED,
    UserVerificationLevel.EMAIL_VERIFIED
];
