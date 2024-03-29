export enum ChangePasswordStep {
    CREATE_EMAIL_CONFIRMATION_CODE = "CREATE_EMAIL_CONFIRMATION_CODE",
    CHECK_EMAIL_CONFIRMATION_CODE = "CHECK_EMAIL_CONFIRMATION_CODE",
    CHANGE_PASSWORD = "CHANGE_PASSWORD",
    NONE = "NONE",
    VALIDATE_FORM_AND_CHECK_IF_CONFIRMATION_CODE_SHOULD_BE_SENT = "VALIDATE_FORM_AND_CHECK_IF_CONFIRMATION_CODE_SHOULD_BE_SENT",
    CHANGE_PASSWORD_SUCCESS = "PASSWORD_CHANGE_SUCCESS",
    CHANGE_PASSWORD_ERROR = "CHANGE_PASSWORD_ERROR"
}
