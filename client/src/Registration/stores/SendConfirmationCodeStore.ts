import {action, observable, reaction} from "mobx";
import {throttle} from "lodash";
import {RegistrationDialogStore} from "./RegistrationDialogStore";
import {validateEmail} from "../validation";
import {RegistrationStep, SendVerificationEmailFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {EmailConfirmationCodeType} from "../../api/types/request";
import {EmailConfirmationCodeResponse} from "../../api/types/response";
import {ApiError, EmailConfirmationCodeApi, getInitialApiErrorFromResponse} from "../../api";
import {LocaleStore} from "../../localization/stores";

export class SendConfirmationCodeStore {
    @observable
    sendVerificationEmailForm: SendVerificationEmailFormData = {
        email: ""
    };

    @observable
    formErrors: FormErrors<SendVerificationEmailFormData> = {
        email: undefined
    };

    @observable
    pending: boolean = false;

    @observable
    checkingEmailAvailability: boolean = false;

    @observable
    error?: ApiError = undefined;

    @observable
    emailConfirmationCodeResponse?: EmailConfirmationCodeResponse = undefined;

    @observable
    sendVerificationEmailDialogOpen: boolean = false;

    constructor(private readonly registrationDialogStore: RegistrationDialogStore,
                private readonly localeStore: LocaleStore) {
        this.checkEmailAvailability = throttle(this.checkEmailAvailability, 300);

        reaction(
            () => this.sendVerificationEmailForm.email,
            email => {
                this.formErrors.email = validateEmail(email);

                if (!this.formErrors.email) {
                    this.checkEmailAvailability();
                }
            }
        )
    }

    @action
    sendVerificationEmail = (): void => {
        this.validateForm()
            .then(formValid => {
                if (!formValid) {
                    return;
                }

                this.pending = true;

                EmailConfirmationCodeApi.createEmailConfirmationCode({
                    email: this.sendVerificationEmailForm.email,
                    language: this.localeStore.selectedLanguage,
                    type: EmailConfirmationCodeType.CONFIRM_EMAIL
                })
                    .then(({data}) => {
                        this.emailConfirmationCodeResponse = data;
                        this.registrationDialogStore.setCurrentStep(RegistrationStep.CHECK_VERIFICATION_CODE);
                    })
                    .catch(error => this.error = getInitialApiErrorFromResponse(error))
                    .finally(() => this.pending = false)
            })
    };

    @action
    setFormValue = <Key extends keyof SendVerificationEmailFormData>(key: Key, value: SendVerificationEmailFormData[Key]): void => {
        this.sendVerificationEmailForm[key] = value;
    };

    @action
    checkEmailAvailability = (): Promise<void> => {
       return new Promise(resolve => {
           this.checkingEmailAvailability = true;

           EmailConfirmationCodeApi.checkEmailAvailability(this.sendVerificationEmailForm.email)
               .then(({data}) => {
                   if (!data.available) {
                       this.formErrors.email = "email.has-already-been-taken";
                   } else {
                       this.formErrors.email = undefined;
                   }
               })
               .finally(() => {
                   this.checkingEmailAvailability = false;
                   resolve();
               });
       })
    };

    @action
    validateForm = (): Promise<boolean> => {
        return new Promise(resolve => {
            this.formErrors = {
                ...this.formErrors,
                email: validateEmail(this.sendVerificationEmailForm.email)
            };

            if (this.formErrors.email) {
                resolve(false);
            }

            this.checkEmailAvailability()
                .then(() => resolve(!Boolean(this.formErrors.email)));
        })
    };

    @action
    reset = () => {
        this.emailConfirmationCodeResponse = undefined;
        this.sendVerificationEmailForm = {
            email: ""
        };
        setTimeout(() => this.formErrors = {
            email: undefined
        });
        this.error = undefined;
    }
}
