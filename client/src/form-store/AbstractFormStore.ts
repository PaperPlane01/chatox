import {action, observable} from "mobx";
import {FormStore} from "./FormStore";
import {FormErrors} from "../utils/types";
import {ApiError} from "../api";
import {Labels} from "../localization";

export abstract class AbstractFormStore<FormType extends object> implements FormStore<FormType> {
    @observable
    formErrors: FormErrors<FormType>;

    @observable
    formValues: FormType;

    @observable
    error?: ApiError = undefined;

    @observable
    pending: boolean = false;

    protected constructor(protected initialFormValues: FormType, protected initialFormErrors: FormErrors<FormType>) {
        this.formValues = initialFormValues;
        this.formErrors = initialFormErrors;
    }

    @action.bound
    public setFormValue<Key extends keyof FormType>(key: Key, value: FormType[Key]): void {
        this.formValues[key] = value;
    }

    @action.bound
    protected setFormError<Key extends keyof FormType>(key: Key, value: keyof Labels | undefined): void {
        this.formErrors[key] = value;
    }

    @action.bound
    protected setFormErrors(formErrors: FormErrors<FormType>): void {
        this.formErrors = formErrors;
    }

    @action.bound
    protected setForm(form: FormType): void {
        this.formValues = form;
    }

    @action.bound
    protected setPending(pending: boolean): void {
        this.pending = pending;
    }

    @action.bound
    protected setError(error?: ApiError): void {
        this.error = error;
    }

    public abstract submitForm(): void;

    protected abstract validateForm(): boolean;

    @action.bound
    protected resetForm(): void {
        this.formValues = this.initialFormValues;
        setTimeout(() => this.formErrors = this.initialFormErrors);
        this.pending = false;
        this.error = undefined;
    }
}

