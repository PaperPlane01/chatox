import {action, makeObservable, observable, reaction} from "mobx";
import {ConfirmationTokenStore} from "./ConfirmationTokenStore";
import {CreateConfirmationTokenFormData, OpenConfirmationTokenDialogOptions} from "../types";
import {AbstractFormStore} from "../../form-store";
import {FormErrors} from "../../utils/types";
import {containsNotUndefinedValues, createWithUndefinedValues} from "../../utils/object-utils";
import {getInitialApiErrorFromResponse, UserApi} from "../../api";
import {validatePassword} from "../../Registration/validation";
import {ConfirmationTokenAction} from "../../api/types/request";

const INITIAL_FORM_VALUES: CreateConfirmationTokenFormData = {
    password: ""
};
const INITIAL_FORM_ERRORS: FormErrors<CreateConfirmationTokenFormData> = createWithUndefinedValues(INITIAL_FORM_VALUES);

export class CreateConfirmationTokenStore extends AbstractFormStore<CreateConfirmationTokenFormData> {
    createConfirmationTokenDialogOpen = false;

    private onConfirmationTokenCreated?: () => void;

    constructor(private readonly confirmationToken: ConfirmationTokenStore) {
        super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS);

        makeObservable<CreateConfirmationTokenStore, "validateForm">(this, {
            createConfirmationTokenDialogOpen: observable,
            submitForm: action.bound,
            validateForm: action.bound,
            openDialog: action.bound,
            closeDialog: action.bound
        });

        reaction(
            () => this.formValues.password,
            password => this.setFormError("password", validatePassword(password))
        );
    }

    openDialog(options?: OpenConfirmationTokenDialogOptions): void {
        this.onConfirmationTokenCreated = options?.onConfirmationTokenCreated;
        this.createConfirmationTokenDialogOpen = true;
    }

    closeDialog(): void {
        this.createConfirmationTokenDialogOpen = false;
    }

    submitForm(): void {
        if (!this.validateForm()) {
            return;
        }

        this.setPending(true);
        this.setError(undefined);

        UserApi.createConfirmationToken({
            password: this.formValues.password,
            actions: [
                ConfirmationTokenAction.TRANSFER_CHAT_OWNERSHIP
            ]
        })
            .then(({data}) => {
                this.confirmationToken.setConfirmationToken(data);
                this.closeDialog();
                this.resetForm();
                this.onConfirmationTokenCreated?.();
            })
            .catch(error => this.setError(getInitialApiErrorFromResponse(error)))
            .finally(() => this.setPending(false));
    }

    protected validateForm(): boolean {
        this.setFormErrors({
            password: validatePassword(this.formValues.password)
        });

        return !containsNotUndefinedValues(this.formErrors);
    }
}