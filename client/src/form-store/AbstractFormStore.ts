import { action, observable, makeObservable } from "mobx";
import {FormStore} from "./FormStore";
import {FormErrors} from "../utils/types";
import {ApiError} from "../api";
import {Labels} from "../localization";

export abstract class AbstractFormStore<FormType extends object> implements FormStore<FormType> {
    formErrors: FormErrors<FormType>;

    formValues: FormType;

    error?: ApiError = undefined;

    pending: boolean = false;

    protected constructor(protected initialFormValues: FormType, protected initialFormErrors: FormErrors<FormType>) {
        makeObservable<AbstractFormStore<FormType>, "setFormError" | "setFormErrors" | "setForm" | "setPending" | "setError" | "resetForm">(
            this,
            {
                formErrors: observable,
                formValues: observable,
                error: observable,
                pending: observable,
                setFormValue: action.bound,
                setFormError: action.bound,
                setFormErrors: action.bound,
                setForm: action.bound,
                setPending: action.bound,
                setError: action.bound,
                resetForm: action.bound
        });

        this.formValues = initialFormValues;
        this.formErrors = initialFormErrors;
    }

    public setFormValue<Key extends keyof FormType>(key: Key, value: FormType[Key]): void {
        this.formValues[key] = value;
    }

    protected setFormError<Key extends keyof FormType>(key: Key, value: keyof Labels | undefined): void {
        this.formErrors[key] = value;
    }

    protected setFormErrors(formErrors: FormErrors<FormType>): void {
        this.formErrors = formErrors;
    }

    protected setForm(form: FormType): void {
        this.formValues = form;
    }

    protected setPending(pending: boolean): void {
        this.pending = pending;
    }

    protected setError(error?: ApiError): void {
        this.error = error;
    }

    public abstract submitForm(): void;

    protected abstract validateForm(): boolean;

    protected resetForm(): void {
        this.formValues = this.initialFormValues;
        setTimeout(() => this.setFormErrors(this.initialFormErrors));
        this.pending = false;
        this.error = undefined;
    }
}

