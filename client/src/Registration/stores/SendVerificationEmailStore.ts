import {action, observable, reaction} from "mobx";
import {throttle} from "lodash";
import {RegistrationDialogStore} from "./RegistrationDialogStore";
import {validateEmail} from "../validation";
import {RegistrationStep, SendVerificationEmailFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {EmailVerificationResponse} from "../../api/types/response";
import {ApiError, EmailVerificationApi, getInitialApiErrorFromResponse} from "../../api";
import {LocaleStore} from "../../localization/stores";

export class SendVerificationEmailStore {
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
    emailVerification?: EmailVerificationResponse = undefined;

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
        console.log("Sending verification email");
        this.validateForm()
            .then(formValid => {
                console.log(`Form valid: ${formValid}`);

                if (!formValid) {
                    return;
                }

                this.pending = true;

                EmailVerificationApi.createEmailVerification({
                    email: this.sendVerificationEmailForm.email,
                    language: this.localeStore.selectedLanguage
                })
                    .then(({data}) => {
                        this.emailVerification = data;
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

           EmailVerificationApi.checkEmailAvailability(this.sendVerificationEmailForm.email)
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
        this.emailVerification = undefined;
        this.sendVerificationEmailForm = {
            email: ""
        };
        setTimeout(() => this.formErrors = {
            email: undefined
        });
        this.error = undefined;
    }
}
