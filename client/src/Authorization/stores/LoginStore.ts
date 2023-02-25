import {action, makeObservable, observable, runInAction} from "mobx";
import {AxiosError} from "axios";
import {AuthorizationStore} from "./AuthorizationStore";
import {LoginFormData} from "../types";
import {API_UNREACHABLE_STATUS, getInitialApiErrorFromResponse, UserApi} from "../../api";
import {FormErrors} from "../../utils/types";
import {validatePassword, validateUsername} from "../../Registration/validation";
import {AbstractFormStore} from "../../form-store";
import {containsNotUndefinedValues, createWithUndefinedValues} from "../../utils/object-utils";

const INITIAL_FORM_VALUES: LoginFormData = {
    username: "",
    password: ""
};
const INITIAL_FORM_ERRORS: FormErrors<LoginFormData> = createWithUndefinedValues(INITIAL_FORM_VALUES);

export class LoginStore extends AbstractFormStore<LoginFormData> {
    loginDialogOpen: boolean = false;

    displayPassword: boolean = false;

    constructor(private  readonly authorizationStore: AuthorizationStore) {
        super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS);

        makeObservable(this, {
            loginDialogOpen: observable,
            displayPassword: observable,
            setLoginDialogOpen: action,
            setDisplayPassword: action,
            submitForm: action,
            validateForm: action
        });
    }

    setLoginDialogOpen = (loginDialogOpen: boolean): void => {
        this.loginDialogOpen = loginDialogOpen;
    };

    setDisplayPassword = (displayPassword: boolean): void => {
        this.displayPassword = displayPassword;
    };

    submitForm = (): void => {
        if (!this.validateForm()) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        UserApi.doLogin(this.formValues.username, this.formValues.password)
            .then(({data}) => runInAction(() => {
                this.authorizationStore.setTokens(data.access_token, data.refresh_token);
                this.authorizationStore.fetchCurrentUser();
                this.loginDialogOpen = false;
                this.resetForm();
            }))
            .catch((error: AxiosError) => {
                const apiError = getInitialApiErrorFromResponse(error);

                if (apiError.status !== API_UNREACHABLE_STATUS) {
                    if (apiError.status === 400) {
                        apiError.message = "login.error.incorrect-username-or-password";
                    } else {
                        apiError.message = "error.unknown";
                    }
                }

                this.setError(apiError);
            })
            .finally(() => this.setPending(false));
    }

    validateForm = (): boolean  => {
        this.formErrors = {
            username: validateUsername(this.formValues.username),
            password: validatePassword(this.formValues.password)
        };

        return !containsNotUndefinedValues(this.formValues)
    }
}
