import {action, observable, reaction} from "mobx";
import {CheckEmailConfirmationCodeFormData, ConfirmationCodeSuccessCheckCallback} from "../types";
import {validateConfirmationCode} from "../validation";
import {FormErrors} from "../../utils/types";
import {ApiError, EmailConfirmationCodeApi, getInitialApiErrorFromResponse} from "../../api";

export class CheckEmailConfirmationCodeStore {
    @observable
    checkEmailConfirmationCodeForm: CheckEmailConfirmationCodeFormData = {
        confirmationCode: ""
    };

    @observable
    formErrors: FormErrors<CheckEmailConfirmationCodeFormData> = {
        confirmationCode: undefined
    };

    @observable
    pending: boolean = false;

    @observable
    error?: ApiError = undefined;

    constructor(private readonly successCheckCallback: ConfirmationCodeSuccessCheckCallback) {
        reaction(
            () => this.checkEmailConfirmationCodeForm.confirmationCode,
            confirmationCode => validateConfirmationCode(confirmationCode)
        );
    }

    @action
    setFormValue = <Key extends keyof CheckEmailConfirmationCodeFormData>(key: Key, value: CheckEmailConfirmationCodeFormData[Key]): void => {
        this.checkEmailConfirmationCodeForm[key] = value;
    };

    @action
    checkEmailConfirmationCode = (emailConfirmationCodeId: string): void => {
        if (!this.validateForm()) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        EmailConfirmationCodeApi.checkEmailConfirmationCode(
            emailConfirmationCodeId,
            {
                confirmationCode: this.checkEmailConfirmationCodeForm.confirmationCode
            }
        )
            .then(({data}) => {
                if (!data.valid) {
                    this.formErrors.confirmationCode = "email.verification.code.invalid";
                    this.successCheckCallback();
                }
            })
            .catch(error => {
                this.error = getInitialApiErrorFromResponse(error);
            })
            .finally(() => this.pending = false);
    };

    @action
    validateForm = (): boolean => {
        this.formErrors.confirmationCode = validateConfirmationCode(this.checkEmailConfirmationCodeForm.confirmationCode);

        return !Boolean(this.formErrors.confirmationCode);
    };

    @action
    reset = (): void => {
        this.checkEmailConfirmationCodeForm = {
            confirmationCode: ""
        };
        setTimeout(() => this.formErrors = {
            confirmationCode: undefined
        });
    }
}
