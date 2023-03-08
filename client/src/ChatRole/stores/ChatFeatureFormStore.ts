import {FormStore} from "../../form-store";

export interface ChatFeatureFormStore<FormType extends object> extends FormStore<FormType> {
    resetForm(): void
    validateForm(): boolean
    populateFromRole(roleId: string): void
}