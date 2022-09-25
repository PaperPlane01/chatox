import {action} from "mobx";
import {ChatFeatureFormStore} from "./ChatFeatureFormStore";
import {AbstractFormStore} from "../../form-store";
import {FormErrors} from "../../utils/types";

export abstract class AbstractChatFeatureFormStore<FormType extends object> extends AbstractFormStore<FormType> implements ChatFeatureFormStore<FormType> {
    protected constructor(initialFormValues: FormType, initialFormErrors: FormErrors<FormType>) {
        super(initialFormValues, initialFormErrors);
    }

    public validateForm(): boolean {
        return true;
    }

    @action.bound
    public resetForm(): void {
        super.resetForm();
    }

    public submitForm(): void {
    }

    public abstract populateFromRole(roleId: string): void;

}
