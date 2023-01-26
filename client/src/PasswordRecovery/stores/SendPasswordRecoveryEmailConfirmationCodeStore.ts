import {reaction} from "mobx";
import {PasswordRecoveryDialogStore} from "./PasswordRecoveryDialogStore";
import {PasswordRecoveryStep} from "../types";
import {LocaleStore} from "../../localization";
import {EmailConfirmationCodeType} from "../../api/types/request";
import {AbstractCreateEmailConfirmationCodeStore} from "../../EmailConfirmation";

export class SendPasswordRecoveryEmailConfirmationCodeStore extends AbstractCreateEmailConfirmationCodeStore {
    constructor(private readonly passwordRecoveryDialogStore: PasswordRecoveryDialogStore,
               localeStore: LocaleStore) {
        super(localeStore);

        reaction(
            () => this.passwordRecoveryDialogStore.currentStep,
            currentStep => {
                if (currentStep === PasswordRecoveryStep.NONE) {
                    this.resetForm();
                }
            }
        );

        reaction(
            () => this.emailConfirmationCode,
            emailConfirmationCode => {
                if (emailConfirmationCode) {
                    this.passwordRecoveryDialogStore.setCurrentStep(PasswordRecoveryStep.CHECK_EMAIL_CONFIRMATION_CODE);
                }
            }
        )
    }

    protected getType(): EmailConfirmationCodeType {
        return EmailConfirmationCodeType.CONFIRM_PASSWORD_RECOVERY;
    }
}
