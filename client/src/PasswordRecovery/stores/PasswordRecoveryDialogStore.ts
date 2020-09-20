import {action, observable} from "mobx";
import {PasswordRecoveryStep} from "../types";

export class PasswordRecoveryDialogStore {
    @observable
    passwordRecoveryDialogOpen: boolean = false;

    @observable
    currentStep: PasswordRecoveryStep = PasswordRecoveryStep.CREATE_EMAIL_CONFIRMATION_CODE;

    @action
    setPasswordRecoveryDialogOpen = (passwordRecoveryDialogOpen: boolean): void => {
        this.passwordRecoveryDialogOpen = passwordRecoveryDialogOpen;
    };

    @action
    setCurrentStep = (currentStep: PasswordRecoveryStep): void => {
        this.currentStep = currentStep;
    };
}
