import {action, observable} from "mobx";
import {RegistrationStep} from "../types";

export class RegistrationDialogStore {
    @observable
    registrationDialogOpen: boolean = false;

    @observable
    currentStep: RegistrationStep = RegistrationStep.SEND_VERIFICATION_EMAIL;

    @action
    setRegistrationDialogOpen = (registrationDialogOpen: boolean) => {
        this.registrationDialogOpen = registrationDialogOpen;
    };

    @action
    setCurrentStep = (registrationStep: RegistrationStep): void => {
        this.currentStep = registrationStep;
    };

    @action
    reset = () => {
        this.registrationDialogOpen = false;
        this.currentStep = RegistrationStep.SEND_VERIFICATION_EMAIL;
    }
}
