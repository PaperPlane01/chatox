import {action, observable} from "mobx";
import {UpdateEmailStep} from "../types";

export class UpdateEmailDialogStore {
    @observable
    updateEmailDialogOpen: boolean = false;

    @observable
    currentStep: UpdateEmailStep = UpdateEmailStep.NONE;

    @action
    setUpdateEmailDialogOpen = (updateEmailDialogOpen: boolean): void => {
        this.updateEmailDialogOpen = updateEmailDialogOpen;
    }

    @action
    setCurrentStep = (currentStep: UpdateEmailStep): void => {
        this.currentStep = currentStep;
    }
}