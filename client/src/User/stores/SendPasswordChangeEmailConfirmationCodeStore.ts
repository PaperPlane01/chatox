import {action, computed, observable} from "mobx";
import {ApiError, EmailConfirmationCodeApi, getInitialApiErrorFromResponse} from "../../api";
import {EmailConfirmationCodeResponse} from "../../api/types/response";
import {LocaleStore} from "../../localization/stores";
import {Language} from "../../localization/types";
import {EmailConfirmationCodeType} from "../../api/types/request";
import {PasswordChangeStepStore} from "./PasswordChangeStepStore";
import {ChangePasswordStep} from "../types";

export class SendPasswordChangeEmailConfirmationCodeStore {
    @observable
    pending: boolean = false;

    @observable
    error?: ApiError = undefined;

    @observable
    emailConfirmationCodeResponse?: EmailConfirmationCodeResponse = undefined;

    @computed
    get currentLanguage(): Language {
        return this.localeStore.selectedLanguage;
    }

    constructor(private readonly localeStore: LocaleStore,
                private readonly passwordChangeStepStore: PasswordChangeStepStore) {}

    @action
    sendEmailConfirmationCode = (): void => {
        this.pending = false;
        this.error = undefined;

        EmailConfirmationCodeApi.createEmailConfirmationCode({
            language: this.currentLanguage,
            type: EmailConfirmationCodeType.CONFIRM_PASSWORD_RESET
        })
            .then(({data}) => {
                this.emailConfirmationCodeResponse = data;
                this.passwordChangeStepStore.setCurrentStep(ChangePasswordStep.CHANGE_PASSWORD);
            })
            .catch(error => this.error = getInitialApiErrorFromResponse(error));
    };

    @action
    reset = (): void => {
        this.emailConfirmationCodeResponse = undefined;
    };
}
