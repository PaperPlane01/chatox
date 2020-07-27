import {action, observable, reaction, computed} from "mobx";
import _ from "lodash";
import {SendVerificationEmailStore} from "./SendVerificationEmailStore";
import {CheckEmailVerificationCodeStore} from "./CheckEmailVerificationCodeStore";
import {RegistrationDialogStore} from "./RegistrationDialogStore";
import {
    validateFirstName,
    validateLastName,
    validatePassword,
    validateRepeatedPassword,
    validateSlug,
    validateUsername
} from "../validation";
import {RegisterUserFormData} from "../types";
import {API_UNREACHABLE_STATUS, ApiError, getInitialApiErrorFromResponse, UserApi} from "../../api";
import {EmailVerificationResponse, RegistrationResponse} from "../../api/types/response";
import {FormErrors} from "../../utils/types";
import {AuthorizationStore} from "../../Authorization";
import {isStringEmpty} from "../../utils/string-utils";

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

    @observable
    displayPassword: boolean = false;

    @computed
    get emailVerification(): EmailVerificationResponse | undefined {
        return this.sendVerificationEmailStore.emailVerification;
    }

    @computed
    get emailVerificationCode(): string | undefined {
        return isStringEmpty(this.checkEmailVerificationCodeStore.checkEmailVerificationCodeForm.verificationCode)
            ? undefined
            : this.checkEmailVerificationCodeStore.checkEmailVerificationCodeForm.verificationCode
    }

    constructor(private readonly authorizationStore: AuthorizationStore,
                private readonly sendVerificationEmailStore: SendVerificationEmailStore,
                private readonly checkEmailVerificationCodeStore: CheckEmailVerificationCodeStore,
                private readonly registrationDialogStore: RegistrationDialogStore) {
        this.checkUsernameAvailability = _.throttle(this.checkUsernameAvailability, 1000);
        this.checkSlugAvailability = _.throttle(this.checkSlugAvailability, 1000);

        reaction(
            () => this.registrationForm.username,
            username => {
                this.registrationFormErrors.username = validateUsername(username);
                if (!this.registrationFormErrors.username) {
                    this.checkUsernameAvailability(username);
                }
            }
        );

        reaction(
            () => this.registrationForm.slug,
            slug => {
                this.registrationFormErrors.slug = validateSlug(slug);
                if (!this.registrationFormErrors.slug) {
                    this.checkSlugAvailability(slug!);
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
    setDisplayPassword = (displayPassword: boolean): void => {
        this.displayPassword = displayPassword;
    };

    @action
    updateFormValue = <Key extends keyof RegisterUserFormData>(key: Key, value: RegisterUserFormData[Key]): void => {
        this.registrationForm[key] = value;
    };

    @action
    registerUser = (): void => {
        this.validateForm().then(formValid => {
            if (formValid) {
                this.pending = true;

                UserApi.registerUser({
                    ...this.registrationForm,
                    email: this.emailVerification && this.emailVerification.email,
                    emailVerificationId: this.emailVerification && this.emailVerification.id,
                    emailVerificationConfirmationCode: this.emailVerificationCode && this.emailVerificationCode,
                    clientId: process.env.REACT_APP_CLIENT_ID as string
                })
                    .then(({data}) => {
                        this.registrationDialogOpen = false;
                        this.registrationResponse = data;
                        this.authorizationStore.setCurrentUser({
                            id: data.userId,
                            accountId: data.accountId,
                            avatarUri: data.avatarUri,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            roles: data.roles,
                            slug: data.slug,
                            createdAt: data.createdAt
                        });
                        this.authorizationStore.setTokens(data.accessToken, data.refreshToken);
                        this.reset();
                        this.registrationDialogStore.reset();
                        this.sendVerificationEmailStore.reset();
                        this.checkEmailVerificationCodeStore.reset();
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
        this.checkingUsernameAvailability = true;

        UserApi.isUsernameAvailable(username)
            .then(({data}) => {
                if (!data.available) {
                    this.registrationFormErrors.username = "username.has-already-been-taken";
                }
            })
            .finally(() => this.checkingUsernameAvailability = false);
    };

    @action
    checkSlugAvailability = (slug: string): void => {
        this.checkingSlugAvailability = true;

        UserApi.isSlugAvailable(slug)
            .then(({data}) => {
                if (!data.available) {
                    this.registrationFormErrors = {
                        ...this.registrationFormErrors,
                        slug: "slug.has-already-been-taken"
                    }
                }
            })
            .finally(() => this.checkingSlugAvailability = false)
    };

    @action
    validateForm = (): Promise<boolean> => {
        return new Promise(resolve => {
            this.registrationFormErrors = {
                ...this.registrationFormErrors,
                username: validateUsername(this.registrationForm.username),
                password: validatePassword(this.registrationForm.password),
                repeatedPassword: validateRepeatedPassword(this.registrationForm.repeatedPassword, this.registrationForm.password),
                firstName: validateFirstName(this.registrationForm.firstName),
                lastName: validateLastName(this.registrationForm.lastName),
                slug: validateSlug(this.registrationForm.slug),
            };

            const {username, password, repeatedPassword, firstName, lastName, slug} = this.registrationFormErrors;

            resolve(!Boolean(username || password || repeatedPassword || firstName || lastName || slug));
        });
    };

    @action
    reset = (): void => {
        this.registrationForm =  {
            username: "",
            password: "",
            repeatedPassword: "",
            firstName: "",
            lastName: undefined,
            slug: undefined
        };
        this.pending = false;
        this.submissionError = undefined;
        this.registrationResponse = undefined;
        setTimeout(() => {
            this.registrationFormErrors = {
                username: undefined,
                password: undefined,
                repeatedPassword: undefined,
                slug: undefined,
                firstName: undefined,
                lastName: undefined
            }
        })
    }
}
