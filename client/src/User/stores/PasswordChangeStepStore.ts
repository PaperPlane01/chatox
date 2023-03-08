import {makeAutoObservable} from "mobx";
import {ChangePasswordStep} from "../types";

export class PasswordChangeStepStore {
    currentStep: ChangePasswordStep = ChangePasswordStep.NONE;

    constructor() {
       makeAutoObservable(this);
    }

    setCurrentStep = (currentStep: ChangePasswordStep): void => {
        this.currentStep = currentStep;
    };
}
