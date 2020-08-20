import {action, observable} from "mobx";
import {ChangePasswordStep} from "../types";

export class PasswordChangeStepStore {
    @observable
    currentStep: ChangePasswordStep = ChangePasswordStep.NONE;

    @action
    setCurrentStep = (currentStep: ChangePasswordStep): void => {
        this.currentStep = currentStep;
    }
}
