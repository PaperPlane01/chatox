import {action, observable, reaction} from "mobx";
import {PasswordRecoveryDialogStore} from "./PasswordRecoveryDialogStore";
import {PasswordRecoveryStep, SendPasswordRecoveryEmailConfirmationCodeFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {validateEmail} from "../../Registration/validation";
import {ApiError, EmailConfirmationCodeApi, getInitialApiErrorFromResponse} from "../../api";
import {LocaleStore} from "../../localization/stores";
import {EmailConfirmationCodeType} from "../../api/types/request";
import {EmailConfirmationCodeResponse} from "../../api/types/response";

export class SendPasswordRecoveryEmailConfirmationCodeStore {
    @observable
    sendPasswordRecoveryEmailConfirmationCodeForm: SendPasswordRecoveryEmailConfirmationCodeFormData = {
        email: ""
    };

    @observable
    formErrors: FormErrors<SendPasswordRecoveryEmailConfirmationCodeFormData> = {
        email: undefined
    };

    @observable
    pending: boolean = false;

    @observable
    error?: ApiError = undefined;

    @observable
    emailConfirmationCode?: EmailConfirmationCodeResponse = undefined;

    constructor(private readonly passwordRecoveryDialogStore: PasswordRecoveryDialogStore,
                private readonly localeStore: LocaleStore) {
        reaction(
            () => this.sendPasswordRecoveryEmailConfirmationCodeForm.email,
            email => this.formErrors.email = validateEmail(email)
        );

        reaction(
            () => this.passwordRecoveryDialogStore.currentStep,
            currentStep => {
                if (currentStep === PasswordRecoveryStep.NONE) {
                    this.reset();
                }
            }
        )
    }

    @action
    setFormValue = <Key extends keyof SendPasswordRecoveryEmailConfirmationCodeFormData>(
        key: Key,
        value: SendPasswordRecoveryEmailConfirmationCodeFormData[Key]
    ): void => {
        this.sendPasswordRecoveryEmailConfirmationCodeForm[key] = value;
    };

    @action
    sendPasswordRecoveryEmailConfirmationCode = (): void => {
        if (!this.validateForm()) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        EmailConfirmationCodeApi.createEmailConfirmationCode({
            email: this.sendPasswordRecoveryEmailConfirmationCodeForm.email,
            language: this.localeStore.selectedLanguage,
            type: EmailConfirmationCodeType.CONFIRM_PASSWORD_RECOVERY
        })
            .then(({data}) => {
                this.emailConfirmationCode = data;
                this.passwordRecoveryDialogStore.setCurrentStep(PasswordRecoveryStep.CHECK_EMAIL_CONFIRMATION_CODE);
            })
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pending = false);
    };

    @action
    validateForm = (): boolean => {
        this.formErrors = {
            ...this.formErrors,
            email: validateEmail(this.sendPasswordRecoveryEmailConfirmationCodeForm.email)
        };

        return !Boolean(this.formErrors.email);
    };

    @action
    reset = (): void => {
        this.emailConfirmationCode = undefined;
        this.sendPasswordRecoveryEmailConfirmationCodeForm = {
            email: ""
        };
        this.error = undefined;
        setTimeout(
            () => this.formErrors = {
                email: undefined
            }
        );
    }
}
