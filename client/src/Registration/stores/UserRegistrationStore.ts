import {action, observable, reaction} from "mobx";
import _ from "lodash";
import {
    validateFirstName,
    validateLastName,
    validatePassword,
    validateRepeatedPassword,
    validateSlug,
    validateUsername
} from "../validation";
import {RegisterUserFormData} from "../types";
import {UserApi, ApiError, getInitialApiErrorFromResponse, API_UNREACHABLE_STATUS} from "../../api";
import {RegistrationResponse} from "../../api/types/response";
import {FormErrors} from "../../utils/types";
import {AuthorizationStore} from "../../Authorization";

export class UserRegistrationStore {
    @observable
    registrationForm: RegisterUserFormData = {
        username: "",
        password: "",
        repeatedPassword: "",
        firstName: "",
        lastName: undefined,
        slug: undefined
    };

    @observable
    registrationFormErrors: FormErrors<RegisterUserFormData> = {
        username: undefined,
        password: undefined,
        repeatedPassword: undefined,
        slug: undefined,
        firstName: undefined,
        lastName: undefined
    };

    @observable
    checkingUsernameAvailability: boolean = false;

    @observable
    checkingSlugAvailability: boolean = false;

    @observable
    pending: boolean = false;

    @observable
    submissionError?: ApiError = undefined;

    @observable
    registrationResponse?: RegistrationResponse = undefined;

    @observable
    registrationDialogOpen: boolean = false;

    private readonly authorizationStore: AuthorizationStore;

    constructor(authorizationStore: AuthorizationStore) {
        this.authorizationStore = authorizationStore;

        reaction(
            () => this.registrationForm.username,
            username => {
                this.registrationFormErrors.username = validateUsername(username);
                if (!this.registrationFormErrors.username) {
                    const checkUsernameAvailabilityDebounced = _.debounce(this.checkUsernameAvailability, 300);
                    checkUsernameAvailabilityDebounced(username);
                }
            }
        );

        reaction(
            () => this.registrationForm.slug,
            slug => {
                this.registrationFormErrors.slug = validateSlug(slug);
                if (!this.registrationFormErrors.slug) {
                    const checkSlugAvailabilityDebounced = _.debounce(this.checkSlugAvailability, 300);
                    checkSlugAvailabilityDebounced(slug!);
                }
            }
        );

        reaction(
            () => this.registrationForm.password,
            password => this.registrationFormErrors.password = validatePassword(password)
        );

        reaction(
            () => this.registrationForm.repeatedPassword,
            repeatedPassword => this.registrationFormErrors.repeatedPassword = validateRepeatedPassword(
                repeatedPassword,
                this.registrationForm.password
            )
        );

        reaction(
            () => this.registrationForm.firstName,
            firstName => this.registrationFormErrors.firstName = validateFirstName(firstName)
        );

        reaction(
            () => this.registrationForm.lastName,
            lastName => this.registrationFormErrors.lastName = validateLastName(lastName)
        )
    }

    @action
    setRegistrationDialogOpen = (registrationDialogOpen: boolean): void => {
        this.registrationDialogOpen = registrationDialogOpen;
    };

    @action
    updateFormValue = (key: keyof RegisterUserFormData, value: string): void => {
        this.registrationForm[key] = value;
    };

    @action
    registerUser = (): void => {
        this.validateForm().then(formValid => {
            if (formValid) {
                this.pending = true;

                UserApi.registerUser({
                    ...this.registrationForm,
                    clientId: process.env.REACT_APP_CLIENT_ID as string
                })
                    .then(({data}) => {
                        this.registrationResponse = data;
                        this.authorizationStore.setCurrentUser({
                            id: data.userId,
                            accountId: data.accountId,
                            avatarUri: data.avatarUri,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            roles: data.roles,
                            slug: data.slug
                        });
                    })
                    .catch(error => {
                        const apiError = getInitialApiErrorFromResponse(error);

                        if (apiError.status !== API_UNREACHABLE_STATUS) {
                            apiError.message = "registration.error.unknown";
                            apiError.bindings = {errorStatus: apiError.status}
                        }

                        this.submissionError = apiError;
                    })
                    .finally(() => this.pending = false);
            }
        })
    };

    @action
    checkUsernameAvailability = (username: string): void => {
        this.checkingSlugAvailability = true;

        UserApi.isUsernameAvailable(username)
            .then(({data}) => {
                if (!data.available) {
                    this.registrationFormErrors.username = "username.has-already-been-taken";
                }
            })
            .finally(() => this.checkingSlugAvailability = false);
    };

    @action
    checkSlugAvailability = (slug: string): void => {
        this.checkingSlugAvailability = true;

        UserApi.isSlugAvailable(slug)
            .then(({data}) => {
                if (!data.available) {
                    this.registrationFormErrors.slug = "slug.has-already-been-taken";
                }
            })
    };

    @action
    validateForm = (): Promise<boolean> => {
        return new Promise(resolve => {
            this.registrationFormErrors.username = validateUsername(this.registrationForm.username);
            this.registrationFormErrors.password = validatePassword(this.registrationForm.password);
            this.registrationFormErrors.repeatedPassword = validateRepeatedPassword(
                this.registrationForm.repeatedPassword,
                this.registrationForm.password
            );
            this.registrationFormErrors.firstName = validateFirstName(this.registrationForm.firstName);
            this.registrationFormErrors.lastName = validateLastName(this.registrationForm.lastName);
            this.registrationFormErrors.slug = validateSlug(this.registrationForm.slug);

            const {username, password, repeatedPassword, firstName, lastName, slug} = this.registrationFormErrors;

            resolve(!Boolean(username && password && repeatedPassword && firstName && lastName && slug));
        });
    }
}
