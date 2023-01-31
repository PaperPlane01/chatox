import {makeAutoObservable} from "mobx";
import {RegistrationStep} from "../types";

export class RegistrationDialogStore {
    registrationDialogOpen: boolean = false;

    currentStep: RegistrationStep = RegistrationStep.SEND_VERIFICATION_EMAIL;

    constructor() {
        makeAutoObservable(this);
    }

    setRegistrationDialogOpen = (registrationDialogOpen: boolean) => {
        this.registrationDialogOpen = registrationDialogOpen;
    };

    setCurrentStep = (registrationStep: RegistrationStep): void => {
        this.currentStep = registrationStep;
    };

    reset = () => {
        this.registrationDialogOpen = false;
        this.currentStep = RegistrationStep.SEND_VERIFICATION_EMAIL;
    };
}
