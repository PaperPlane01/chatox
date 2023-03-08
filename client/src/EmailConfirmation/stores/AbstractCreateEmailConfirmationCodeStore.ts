import {action, makeObservable, reaction, runInAction} from "mobx";
import {CreateEmailConfirmationCodeFormData} from "../types";
import {EmailConfirmationCodeApi, getInitialApiErrorFromResponse} from "../../api";
import {EmailConfirmationCodeType} from "../../api/types/request";
import {EmailConfirmationCodeResponse} from "../../api/types/response";
import {AbstractFormStore} from "../../form-store";
import {FormErrors} from "../../utils/types";
import {containsNotUndefinedValues} from "../../utils/object-utils";
import {LocaleStore} from "../../localization";
import {validateEmail} from "../../Registration/validation";

const INITIAL_FORM_VALUES: CreateEmailConfirmationCodeFormData = {
    email: ""
};
const INITIAL_FORM_ERRORS: FormErrors<CreateEmailConfirmationCodeFormData> = {
    email: undefined
};

export abstract class AbstractCreateEmailConfirmationCodeStore extends AbstractFormStore<CreateEmailConfirmationCodeFormData> {
    emailConfirmationCode?: EmailConfirmationCodeResponse = undefined;

    protected constructor(private readonly localeStore: LocaleStore) {
        super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS);

        makeObservable(this, {
            reset: action
        });

        reaction(
            () => this.formValues.email,
            email => this.setFormError("email", validateEmail(email))
        );
    }

    submitForm(): void {
        if (!this.validateForm()) {
            return;
        }

        this.setPending(true);
        this.setError(undefined);

        EmailConfirmationCodeApi.createEmailConfirmationCode({
            email: this.formValues.email,
            language: this.localeStore.selectedLanguage,
            type: this.getType()
        })
            .then(({data}) => runInAction(() => this.emailConfirmationCode = data))
            .catch(error => this.setError(getInitialApiErrorFromResponse(error)))
            .finally(() => this.setPending(false))
    }

    protected validateForm = (): boolean => {
        this.setFormErrors({
            email: validateEmail(this.formValues.email)
        });

        return !containsNotUndefinedValues(this.formErrors);
    };

    protected abstract getType(): EmailConfirmationCodeType;

    reset = (): void => {
        this.resetForm();
        this.emailConfirmationCode = undefined;
    };
}