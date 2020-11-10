import {action, observable, reaction} from "mobx";
import {PasswordRecoveryStep} from "../types";

export class PasswordRecoveryDialogStore {
    @observable
    passwordRecoveryDialogOpen: boolean = false;

    @observable
    currentStep: PasswordRecoveryStep = PasswordRecoveryStep.NONE;

    constructor() {
        reaction(
            () => this.passwordRecoveryDialogOpen,
            open => {
                if (!open) {
                    this.setCurrentStep(PasswordRecoveryStep.NONE);
                }
            }
        )
    }

    @action
    setPasswordRecoveryDialogOpen = (passwordRecoveryDialogOpen: boolean): void => {
        this.passwordRecoveryDialogOpen = passwordRecoveryDialogOpen;
    };

    @action
    setCurrentStep = (currentStep: PasswordRecoveryStep): void => {
        this.currentStep = currentStep;
    };
}
