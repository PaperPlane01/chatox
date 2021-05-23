import {FormErrors} from "../utils/types";
import {ApiError} from "../api";

export interface FormStore<FormType extends object> {
    formValues: FormType;
    formErrors: FormErrors<FormType>;
    pending: boolean;
    error?: ApiError;
    setFormValue: <Key extends keyof FormType>(key: Key, value: FormType[Key]) => void;
    submitForm: () => void
}
