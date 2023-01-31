import {action, observable, reaction, runInAction} from "mobx";
import {UpdateEmailDialogStore} from "./UpdateEmailDialogStore";
import {UpdateEmailStep} from "../types";
import {AbstractCreateEmailConfirmationCodeStore} from "../../EmailConfirmation";
import {UserApi} from "../../api";
import {EmailConfirmationCodeType} from "../../api/types/request";
import {LocaleStore} from "../../localization";
import {validateEmail} from "../../Registration/validation";

export class SendNewEmailConfirmationCodeStore extends AbstractCreateEmailConfirmationCodeStore {
    @observable
    checkingEmailAvailability: boolean = false;

    constructor(private readonly updateEmailDialogStore: UpdateEmailDialogStore,
                localeStore: LocaleStore) {
        super(localeStore);

        reaction(
            () => this.emailConfirmationCode,
            emailConfirmationCode => {
                if (emailConfirmationCode) {
                    updateEmailDialogStore.setCurrentStep(UpdateEmailStep.CHECK_NEW_EMAIL_CONFIRMATION_CODE);
                }
            }
        );

        reaction(
            () => this.formValues.email,
            email => {
                this.setFormError("email", validateEmail(email));
                this.checkEmailAvailability();
            }
        )
    }

    @action
    checkEmailAvailability = (): void => {
        if (this.formErrors.email) {
            return;
        }

        this.checkingEmailAvailability = true;

        UserApi
            .checkEmailAvailability(this.formValues.email)
            .then(({data}) => {
                if (!data.available) {
                    this.setFormError("email", "email.has-already-been-taken");
                }
            })
            .finally(() => runInAction(() => this.checkingEmailAvailability = false));
    }

    protected getType(): EmailConfirmationCodeType {
        return EmailConfirmationCodeType.CONFIRM_EMAIL;
    }

}