import {makeAutoObservable, reaction} from "mobx";
import {RegisterAnonymousUserFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {ApiError, getInitialApiErrorFromResponse, UserApi} from "../../api";
import {AuthorizationStore} from "../../Authorization/stores";
import {validateFirstName, validateLastName} from "../validation";

export class AnonymousRegistrationDialogStore {
    anonymousRegistrationForm: RegisterAnonymousUserFormData = {
        firstName: "",
        lastName: undefined
    };

    formErrors: FormErrors<RegisterAnonymousUserFormData> = {
        firstName: undefined,
        lastName: undefined
    };

    pending: boolean = false;

    error?: ApiError = undefined;

    anonymousRegistrationDialogOpen: boolean = false;

    constructor(private readonly authorizationStore: AuthorizationStore) {
        makeAutoObservable(this);

        reaction(
            () => this.anonymousRegistrationForm.firstName,
            firstName => this.formErrors.firstName = validateFirstName(firstName)
        );

        reaction(
            () => this.anonymousRegistrationForm.lastName,
            lastName => this.formErrors.lastName = validateLastName(lastName)
        );
    }

    setFormValue = <Key extends keyof RegisterAnonymousUserFormData>(key: Key, value: RegisterAnonymousUserFormData[Key]): void => {
        this.anonymousRegistrationForm[key] = value;
    };

    setAnonymousRegistrationDialogOpen = (anonymousRegistrationDialogOpen: boolean): void => {
        this.anonymousRegistrationDialogOpen = anonymousRegistrationDialogOpen;
    };

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
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pending = false);
    };

    validateForm = (): boolean => {
        this.formErrors = {
            ...this.formErrors,
            firstName: validateFirstName(this.anonymousRegistrationForm.firstName),
            lastName: validateLastName(this.anonymousRegistrationForm.lastName)
        };

        const {firstName, lastName} = this.formErrors;

        return !Boolean(firstName || lastName);
    };

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
    };
}
