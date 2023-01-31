import {action, computed, observable, reaction} from "mobx";
import {CheckEmailConfirmationCodeFormData, ConfirmationCodeSuccessCheckCallback} from "../types";
import {validateConfirmationCode} from "../validation";
import {FormErrors} from "../../utils/types";
import {ApiError, EmailConfirmationCodeApi, getInitialApiErrorFromResponse} from "../../api";
import {AbstractFormStore} from "../../form-store";
import {containsNotUndefinedValues} from "../../utils/object-utils";

const INITIAL_FORM_VALUES: CheckEmailConfirmationCodeFormData = {
    confirmationCode: ""
};
const INITIAL_FORM_ERRORS: FormErrors<CheckEmailConfirmationCodeFormData> = {
    confirmationCode: undefined
};

export class CheckEmailConfirmationCodeStore extends AbstractFormStore<CheckEmailConfirmationCodeFormData>{
    @observable
    pending: boolean = false;

    @observable
    error?: ApiError = undefined;

    @observable
    emailConfirmationCodeId?: string = undefined;

    /**
     * @deprecated
     */
    @computed
    get checkEmailConfirmationCodeForm(): CheckEmailConfirmationCodeFormData {
        return this.formValues;
    }

    constructor(private readonly successCheckCallback: ConfirmationCodeSuccessCheckCallback) {
        super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS)

        reaction(
            () => this.formValues.confirmationCode,
            confirmationCode => this.setFormError("confirmationCode", validateConfirmationCode(confirmationCode))
        );
    }

    @action
    checkEmailConfirmationCode = (emailConfirmationCodeId: string): void => {
        this.emailConfirmationCodeId = emailConfirmationCodeId;
        this.submitForm();
    }

    @action
    submitForm = (): void => {
        if (!this.validateForm() || !this.emailConfirmationCodeId) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        EmailConfirmationCodeApi.checkEmailConfirmationCode(
            this.emailConfirmationCodeId,
            {
                confirmationCode: this.formValues.confirmationCode
            }
        )
            .then(({data}) => {
                if (!data.valid) {
                    this.setFormError("confirmationCode", "email.verification.code.invalid")
                } else {
                    this.successCheckCallback();
                }
            })
            .catch(error => this.setError(getInitialApiErrorFromResponse(error)))
            .finally(() => this.setPending(false));
    }

    @action
    validateForm = (): boolean => {
        this.setFormErrors({
            confirmationCode: validateConfirmationCode(this.formValues.confirmationCode)
        });

        return !containsNotUndefinedValues(this.formErrors);
    }

    @action.bound
    reset = (): void => {
        this.resetForm();
        this.emailConfirmationCodeId = undefined;
    }
}
