import {action, makeObservable, observable, reaction} from "mobx";
import {SelectUserFormData} from "../types";
import {validateSelectedUserIdOrSlug} from "../validation";
import {AbstractFormStore} from "../../form-store";
import {FormErrors} from "../../utils/types";
import {containsNotUndefinedValues, createWithUndefinedValues} from "../../utils/object-utils";
import {EntitiesStore} from "../../entities-store";
import {UserEntity} from "../../User";
import {getInitialApiErrorFromResponse, UserApi} from "../../api";

const INITIAL_FORM_VALUES: SelectUserFormData = {
    userIdOrSlug: ""
};
const INITIAL_FOR_ERRORS: FormErrors<SelectUserFormData> = createWithUndefinedValues(INITIAL_FORM_VALUES);

export class SelectUserStore extends AbstractFormStore<SelectUserFormData> {
    selectedUser: UserEntity | undefined;

    constructor(private readonly entities: EntitiesStore) {
        super(INITIAL_FORM_VALUES, INITIAL_FOR_ERRORS);

        makeObservable<SelectUserStore, "validateForm">(this, {
            selectedUser: observable,
            setSelectedUser: action,
            submitForm: action,
            validateForm: action,
            reset: action
        });

        reaction(
            () => this.formValues.userIdOrSlug,
            userIdOrSlug => this.setFormError("userIdOrSlug", validateSelectedUserIdOrSlug(userIdOrSlug))
        );
    }

    setSelectedUser = (user?: UserEntity): void => {
        this.selectedUser = user;
    }

    submitForm = (): void => {
        if (!this.validateForm()) {
            return;
        }

        this.setPending(true);
        this.setError(undefined);

        UserApi.getUserByIdOrSlug(this.formValues.userIdOrSlug)
            .then(({data}) => {
                const user = this.entities.users.insert(data);
                this.setSelectedUser(user);
            })
            .catch(error => this.setError(getInitialApiErrorFromResponse(error)))
            .finally(() => this.setPending(false));
    }

    protected validateForm(): boolean {
        this.setFormErrors({
            ...this.formErrors,
            userIdOrSlug: validateSelectedUserIdOrSlug(this.formValues.userIdOrSlug)
        });

        return !containsNotUndefinedValues(this.formErrors);
    }

    reset = (): void => {
        this.resetForm();
        this.setSelectedUser(undefined);
    }
}