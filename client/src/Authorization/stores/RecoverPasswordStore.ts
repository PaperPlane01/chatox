import {action, observable, reaction} from "mobx";
import {SendPasswordRecoveryEmailConfirmationCodeStore} from "./CreatePasswordRecoveryEmailConfirmationCodeStore";
import {PasswordRecoveryDialogStore} from "./PasswordRecoveryDialogStore";
import {PasswordRecoveryStep, RecoverPasswordForm} from "../types";
import {FormErrors} from "../../utils/types";
import {CheckEmailConfirmationCodeStore} from "../../EmailConfirmation/stores";
import {validatePassword, validateRepeatedPassword} from "../../Registration/validation";
import {ApiError, getInitialApiErrorFromResponse, UserApi} from "../../api";

export class RecoverPasswordStore {
    @observable
    recoverPasswordForm: RecoverPasswordForm = {
        password: "",
        repeatedPassword: ""
    };

    @observable
    formErrors: FormErrors<RecoverPasswordForm> = {
        password: undefined,
        repeatedPassword: undefined
    };

    @observable
    pending: boolean = false;

    @observable
    error?: ApiError = undefined;

    constructor(private readonly passwordRecoveryDialogStore: PasswordRecoveryDialogStore,
                private readonly createPasswordRecoveryEmailConfirmationCodeStore: SendPasswordRecoveryEmailConfirmationCodeStore,
                private readonly checkEmailConfirmationCodeStore: CheckEmailConfirmationCodeStore) {
        reaction(
            () => this.recoverPasswordForm.password,
            password => this.formErrors.password = validatePassword(password)
        );

        reaction(
            () => this.recoverPasswordForm.repeatedPassword,
            repeatedPassword => {
                if (!this.formErrors.password) {
                    this.formErrors.repeatedPassword = validateRepeatedPassword(repeatedPassword, this.recoverPasswordForm.password);
                }
            }
        );
    }

    @action
    setFormValue = <Key extends keyof RecoverPasswordForm>(key: Key, value: RecoverPasswordForm[Key]): void => {
        this.recoverPasswordForm[key] = value;
    };

    @action
    recoverPassword = (): void => {
        if (!this.validateForm()) {
            return;
        }

        this.pending = false;
        this.error = undefined;

        UserApi.recoverPassword({
            emailConfirmationCodeId: this.createPasswordRecoveryEmailConfirmationCodeStore.emailConfirmationCode!.id,
            emailConfirmationCode: this.checkEmailConfirmationCodeStore.checkEmailConfirmationCodeForm.confirmationCode,
            ...this.recoverPasswordForm
        })
            .then(() => this.passwordRecoveryDialogStore.setCurrentStep(PasswordRecoveryStep.PASSWORD_RECOVERY_COMPLETED))
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pending = false);
    };

    @action
    validateForm = (): boolean => {
        this.formErrors = {
            ...this.formErrors,
            password: validatePassword(this.recoverPasswordForm.password),
            repeatedPassword: validateRepeatedPassword(this.recoverPasswordForm.repeatedPassword, this.recoverPasswordForm.password)
        };

        const {password, repeatedPassword} = this.formErrors;

        return !Boolean(password || repeatedPassword);
    };
 }
