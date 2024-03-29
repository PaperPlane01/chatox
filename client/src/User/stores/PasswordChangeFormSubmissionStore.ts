import {makeAutoObservable, reaction} from "mobx";
import {ChangePasswordFormData, ChangePasswordStep} from "../types";
import {FormErrors} from "../../utils/types";
import {ApiError, getInitialApiErrorFromResponse, UserApi} from "../../api";
import {validatePassword, validateRepeatedPassword} from "../../Registration/validation";
import {PasswordChangeStepStore} from "./PasswordChangeStepStore";

export interface EmailConfirmationArguments {
    emailConfirmationId: string,
    emailConfirmationCode: string
}

const CHANGE_PASSWORD_FORM_INITIAL_STATE: ChangePasswordFormData = {
    currentPassword: "",
    password: "",
    repeatedPassword: ""
};

const FORM_ERRORS_INITIAL_STATE: FormErrors<ChangePasswordFormData> = {
    currentPassword: undefined,
    password: undefined,
    repeatedPassword: undefined
};

export class PasswordChangeFormSubmissionStore {
    passwordChangeForm: ChangePasswordFormData = CHANGE_PASSWORD_FORM_INITIAL_STATE;

    formErrors: FormErrors<ChangePasswordFormData> = FORM_ERRORS_INITIAL_STATE;

    pending: boolean = false;

    error?: ApiError = undefined;

    displayPassword: boolean = false;

    constructor(private readonly passwordChangeStepStore: PasswordChangeStepStore) {
       makeAutoObservable(this);

        reaction(
            () => this.passwordChangeForm.currentPassword,
            currentPassword => this.formErrors.currentPassword = validatePassword(currentPassword)
        );

        reaction(
            () => this.passwordChangeForm.password,
            password => this.formErrors.password = validatePassword(password)
        );

        reaction(
            () => this.passwordChangeForm.repeatedPassword,
            repeatedPassword => this.formErrors.repeatedPassword = validateRepeatedPassword(
                repeatedPassword,
                this.passwordChangeForm.password
            )
        );
    };

    setFormValue = <Key extends keyof ChangePasswordFormData>(key: Key, value: ChangePasswordFormData[Key]): void => {
        this.passwordChangeForm[key] = value;
    };

    submitForm = (emailConfirmationArguments?: EmailConfirmationArguments): void => {
        if (!this.validateForm()) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        UserApi.updatePassword({
            currentPassword: this.passwordChangeForm.currentPassword,
            password: this.passwordChangeForm.password,
            repeatedPassword: this.passwordChangeForm.repeatedPassword,
            emailConfirmationCode: emailConfirmationArguments && emailConfirmationArguments.emailConfirmationCode,
            emailConfirmationCodeId: emailConfirmationArguments && emailConfirmationArguments.emailConfirmationId
        })
            .then(() => this.passwordChangeStepStore.setCurrentStep(ChangePasswordStep.CHANGE_PASSWORD_SUCCESS))
            .catch(error => {
                this.error = getInitialApiErrorFromResponse(error);
                this.passwordChangeStepStore.setCurrentStep(ChangePasswordStep.CHANGE_PASSWORD_ERROR);
            })
            .finally(() => this.pending = false);
    };

    validateForm = (): boolean => {
        this.formErrors = {
            currentPassword: validatePassword(this.passwordChangeForm.currentPassword),
            password: validatePassword(this.passwordChangeForm.password),
            repeatedPassword: validateRepeatedPassword(
                this.passwordChangeForm.repeatedPassword,
                this.passwordChangeForm.password
            )
        };

        const {currentPassword, password, repeatedPassword} = this.formErrors;

        return !Boolean(currentPassword || password || repeatedPassword);
    };

    setDisplayPassword = (displayPassword: boolean): void => {
        this.displayPassword = displayPassword;
    };

    reset = (): void => {
        this.passwordChangeForm = CHANGE_PASSWORD_FORM_INITIAL_STATE;
        setTimeout(() => this.formErrors = FORM_ERRORS_INITIAL_STATE);
    };
}
