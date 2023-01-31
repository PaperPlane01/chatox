import {makeAutoObservable, reaction} from "mobx";
import {PasswordRecoveryStep} from "../types";

export class PasswordRecoveryDialogStore {
    passwordRecoveryDialogOpen: boolean = false;

    currentStep: PasswordRecoveryStep = PasswordRecoveryStep.NONE;

    constructor() {
       makeAutoObservable(this);

        reaction(
            () => this.passwordRecoveryDialogOpen,
            open => {
                if (!open) {
                    this.setCurrentStep(PasswordRecoveryStep.NONE);
                }
            }
        )
    }

    setPasswordRecoveryDialogOpen = (passwordRecoveryDialogOpen: boolean): void => {
        this.passwordRecoveryDialogOpen = passwordRecoveryDialogOpen;
    };

    setCurrentStep = (currentStep: PasswordRecoveryStep): void => {
        this.currentStep = currentStep;
    };
}
