import {action, computed, observable, reaction} from "mobx";
import {RegistrationDialogStore} from "./RegistrationDialogStore";
import {SendVerificationEmailStore} from "./SendVerificationEmailStore";
import {CheckEmailVerificationCodeFormData, RegistrationStep} from "../types";
import {validateVerificationCode} from "../validation";
import {FormErrors} from "../../utils/types";
import {ApiError, EmailVerificationApi, getInitialApiErrorFromResponse} from "../../api";
import {EmailVerificationResponse} from "../../api/types/response";

export class CheckEmailVerificationCodeStore {
    @observable
    checkEmailVerificationCodeForm: CheckEmailVerificationCodeFormData = {
        verificationCode: ""
    };

    @observable
    formErrors: FormErrors<CheckEmailVerificationCodeFormData> = {
        verificationCode: undefined
    };

    @observable
    pending: boolean = false;

    @observable
    error?: ApiError = undefined;

    @computed
    get emailVerification(): EmailVerificationResponse {
        return this.sendVerificationEmailStore.emailVerification!;
    }

    constructor(private readonly registrationDialogStore: RegistrationDialogStore,
                private readonly sendVerificationEmailStore: SendVerificationEmailStore) {
        reaction(
            () => this.checkEmailVerificationCodeForm.verificationCode,
            verificationCode => this.formErrors.verificationCode = validateVerificationCode(verificationCode)
        );
    }

    @action
    setFormValue = <Key extends keyof CheckEmailVerificationCodeFormData>(key: Key, value: CheckEmailVerificationCodeFormData[Key]): void => {
        this.checkEmailVerificationCodeForm[key] = value;
    };

    @action
    checkVerificationCode = (): void => {
        if (!this.validateForm()) {
            return;
        }

        this.pending = true;

        EmailVerificationApi.checkEmailVerificationCode(
            this.emailVerification.id,
            {...this.checkEmailVerificationCodeForm}
        )
            .then(() => this.registrationDialogStore.setCurrentStep(RegistrationStep.REGISTER))
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pending = false);
    };

    @action
    validateForm = (): boolean => {
        this.formErrors = {
            ...this.formErrors,
            verificationCode: validateVerificationCode(this.checkEmailVerificationCodeForm.verificationCode)
        };

        return !Boolean(this.formErrors.verificationCode);
    };
}
