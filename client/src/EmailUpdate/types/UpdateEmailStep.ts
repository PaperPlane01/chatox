export enum UpdateEmailStep {
    NONE = "NONE",
    CREATE_CHANGE_EMAIL_CONFIRMATION_CODE = "CREATE_CHANGE_EMAIL_CONFIRMATION_CODE",
    CHECK_CHANGE_EMAIL_CONFIRMATION_CODE = "CHECK_CHANGE_EMAIL_CONFIRMATION_CODE",
    CREATE_NEW_EMAIL_CONFIRMATION_CODE = "CREATE_NEW_EMAIL_CONFIRMATION_CODE",
    CHECK_NEW_EMAIL_CONFIRMATION_CODE = "CHECK_NEW_EMAIL_CONFIRMATION_CODE",
    UPDATE_EMAIL = "UPDATE_EMAIL",
    ERROR = "ERROR"
}