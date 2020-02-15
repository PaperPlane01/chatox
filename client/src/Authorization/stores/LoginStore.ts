import {action, observable} from "mobx";
import {AxiosError} from "axios";
import {AuthorizationStore} from "./AuthorizationStore";
import {API_UNREACHABLE_STATUS, ApiError, getInitialApiErrorFromResponse, UserApi} from "../../api";
import {LoginFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {validatePassword, validateUsername} from "../../Registration/validation";

export class LoginStore {
    @observable
    loginForm: LoginFormData = {
        username: "",
        password: ""
    };

    @observable
    loginFormErrors: FormErrors<LoginFormData> = {
        username: undefined,
        password: undefined
    };

    @observable
    pending: boolean = false;

    @observable
    error?: ApiError = undefined;

    @observable
    loginDialogOpen: boolean = false;

    @observable
    displayPassword: boolean = false;

    private readonly authorizationStore: AuthorizationStore;

    constructor(authorizationStore: AuthorizationStore) {
        this.authorizationStore = authorizationStore;
    }

    @action
    setLoginDialogOpen = (loginDialogOpen: boolean): void => {
        this.loginDialogOpen = loginDialogOpen;
    };

    @action
    setDisplayPassword = (displayPassword: boolean): void => {
        this.displayPassword = displayPassword;
    };

    @action
    updateLoginFormValue = (key: keyof LoginFormData, value: string): void => {
        this.loginForm = {
            ...this.loginForm,
            [key]: value
        };
    };

    @action
    doLogin = (): void => {
        this.validateForm().then(formValid => {
            if (formValid) {
                this.pending = true;
                this.error = undefined;

                UserApi.doLogin(this.loginForm.username, this.loginForm.password)
                    .then(({data}) => {
                        this.authorizationStore.setTokens(data.access_token, data.refresh_token);
                        this.authorizationStore.fetchCurrentUser();
                        this.loginDialogOpen = false;
                        this.reset();
                    })
                    .catch((error: AxiosError) => {
                        const apiError = getInitialApiErrorFromResponse(error);

                        if (apiError.status !== API_UNREACHABLE_STATUS) {
                            if (apiError.status === 401) {
                                apiError.message = "login.error.incorrect-username-or-password";
                            } else {
                                apiError.message = "error.unknown";
                            }
                        }

                        this.error = apiError;
                    })
                    .finally(() => this.pending = false);
            }
        })
    };

    @action
    validateForm = (): Promise<boolean> => {
        return new Promise<boolean>(resolve => {
            this.loginFormErrors = {
                ...this.loginFormErrors,
                username: validateUsername(this.loginForm.username),
                password: validatePassword(this.loginForm.password)
            };

            const {username, password} = this.loginFormErrors;

            resolve(!Boolean(username || password));
        })
    };

    @action
    reset = (): void => {
        this.loginForm =  {
            username: "",
            password: ""
        };
        this.pending = false;
        this.error = undefined;
        setTimeout(() => {
            this.loginFormErrors =  {
                username: undefined,
                password: undefined
            };
        });
    }
}
