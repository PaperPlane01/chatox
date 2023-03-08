import {ChatFeatureFormStore} from "./ChatFeatureFormStore";
import {AbstractFormStore} from "../../form-store";
import {FormErrors} from "../../utils/types";
import {action, makeObservable, override} from "mobx";

export abstract class AbstractChatFeatureFormStore<FormType extends object> extends AbstractFormStore<FormType> implements ChatFeatureFormStore<FormType> {
    protected constructor(initialFormValues: FormType, initialFormErrors: FormErrors<FormType>) {
        super(initialFormValues, initialFormErrors);

        makeObservable(this, {
            validateForm: action,
            resetForm: override,
            submitForm: action
        });
    }

    public validateForm(): boolean {
        return true;
    }

    public resetForm(): void {
        super.resetForm();
    }

    public submitForm(): void {
    }

    public abstract populateFromRole(roleId: string): void;

}
