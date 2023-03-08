import {makeAutoObservable} from "mobx";
import {UpdateEmailStep} from "../types";

export class UpdateEmailDialogStore {
    updateEmailDialogOpen: boolean = false;

    currentStep: UpdateEmailStep = UpdateEmailStep.NONE;

    constructor() {
        makeAutoObservable(this);
    }

    setUpdateEmailDialogOpen = (updateEmailDialogOpen: boolean): void => {
        this.updateEmailDialogOpen = updateEmailDialogOpen;
    };

    setCurrentStep = (currentStep: UpdateEmailStep): void => {
        this.currentStep = currentStep;
    };
}