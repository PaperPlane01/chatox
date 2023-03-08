import {makeAutoObservable} from "mobx";
import {ApiError, EmailConfirmationCodeApi, getInitialApiErrorFromResponse} from "../../api";
import {EmailConfirmationCodeResponse} from "../../api/types/response";
import {LocaleStore} from "../../localization/stores";
import {Language} from "../../localization/types";
import {EmailConfirmationCodeType} from "../../api/types/request";
import {PasswordChangeStepStore} from "./PasswordChangeStepStore";
import {ChangePasswordStep} from "../types";

export class SendPasswordChangeEmailConfirmationCodeStore {
    pending: boolean = false;

    error?: ApiError = undefined;

    emailConfirmationCodeResponse?: EmailConfirmationCodeResponse = undefined;

    get currentLanguage(): Language {
        return this.localeStore.selectedLanguage;
    }

    constructor(private readonly localeStore: LocaleStore,
                private readonly passwordChangeStepStore: PasswordChangeStepStore) {
        makeAutoObservable(this);
    }

    sendEmailConfirmationCode = (): void => {
        this.pending = true;
        this.error = undefined;

        EmailConfirmationCodeApi.createEmailConfirmationCode({
            language: this.currentLanguage,
            type: EmailConfirmationCodeType.CONFIRM_PASSWORD_RESET
        })
            .then(({data}) => {
                this.emailConfirmationCodeResponse = data;
                this.passwordChangeStepStore.setCurrentStep(ChangePasswordStep.CHECK_EMAIL_CONFIRMATION_CODE);
            })
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pending = false);
    };

    reset = (): void => {
        this.emailConfirmationCodeResponse = undefined;
    };
}
