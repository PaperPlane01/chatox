import {makeAutoObservable, reaction} from "mobx";
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
    sendVerificationEmailForm: SendVerificationEmailFormData = {
        email: ""
    };

    formErrors: FormErrors<SendVerificationEmailFormData> = {
        email: undefined
    };

    pending: boolean = false;

    checkingEmailAvailability: boolean = false;

    error?: ApiError = undefined;

    emailConfirmationCodeResponse?: EmailConfirmationCodeResponse = undefined;

    sendVerificationEmailDialogOpen: boolean = false;

    constructor(private readonly registrationDialogStore: RegistrationDialogStore,
                private readonly localeStore: LocaleStore) {
        makeAutoObservable(this);

        this.checkEmailAvailability = throttle(this.checkEmailAvailability, 300) as () => Promise<void>;

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

    setFormValue = <Key extends keyof SendVerificationEmailFormData>(key: Key, value: SendVerificationEmailFormData[Key]): void => {
        this.sendVerificationEmailForm[key] = value;
    };

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

    reset = () => {
        this.emailConfirmationCodeResponse = undefined;
        this.sendVerificationEmailForm = {
            email: ""
        };
        setTimeout(() => this.formErrors = {
            email: undefined
        });
        this.error = undefined;
    };
}
