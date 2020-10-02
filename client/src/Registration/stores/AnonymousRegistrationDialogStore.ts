import {action, observable, reaction} from "mobx";
import {RegisterAnonymousUserFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {ApiError, UserApi} from "../../api";
import {AuthorizationStore} from "../../Authorization/stores";
import {validateFirstName, validateLastName} from "../validation";

export class AnonymousRegistrationDialogStore {
    @observable
    anonymousRegistrationForm: RegisterAnonymousUserFormData = {
        firstName: "",
        lastName: undefined
    }

    @observable
    formErrors: FormErrors<RegisterAnonymousUserFormData> = {
        firstName: undefined,
        lastName: undefined
    };

    @observable
    pending: boolean = false;

    @observable
    error?: ApiError = undefined;

    @observable
    anonymousRegistrationDialogOpen: boolean = false;

    constructor(private readonly authorizationStore: AuthorizationStore) {
        reaction(
            () => this.anonymousRegistrationForm.firstName,
            firstName => this.formErrors.firstName = validateFirstName(firstName)
        );

        reaction(
            () => this.anonymousRegistrationForm.lastName,
            lastName => this.formErrors.lastName = validateLastName(lastName)
        );
    }

    @action
    setFormValue = <Key extends keyof RegisterAnonymousUserFormData>(key: Key, value: RegisterAnonymousUserFormData[Key]): void => {
        this.anonymousRegistrationForm[key] = value;
    };

    @action
    setAnonymousRegistrationDialogOpen = (anonymousRegistrationDialogOpen: boolean): void => {
        this.anonymousRegistrationDialogOpen = anonymousRegistrationDialogOpen;
    };

    @action
    registerAnonymousUser = (): void => {
        if (!this.validateForm()) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        UserApi.registerAnonymousUser({
            ...this.anonymousRegistrationForm,
            clientId: process.env.REACT_APP_CLIENT_ID as string
        })
            .then(({data}) => {
                this.reset();
                this.authorizationStore.setCurrentUser({
                    accountId: data.accountId,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    id: data.userId,
                    roles: data.roles,
                    createdAt: data.createdAt
                });
                this.authorizationStore.setTokens(data.accessToken, data.refreshToken);
            })
    };

    @action
    validateForm = (): boolean => {
        this.formErrors = {
            ...this.formErrors,
            firstName: validateFirstName(this.anonymousRegistrationForm.firstName),
            lastName: validateLastName(this.anonymousRegistrationForm.lastName)
        };

        const {firstName, lastName} = this.formErrors;

        return !Boolean(firstName || lastName);
    };

    @action
    reset = (): void => {
        this.setAnonymousRegistrationDialogOpen(false);
        this.anonymousRegistrationForm = {
            firstName: "",
            lastName: undefined
        };
        setTimeout(
            () => this.formErrors = {firstName: undefined, lastName: undefined}
        );
        this.error = undefined;
    }
}
