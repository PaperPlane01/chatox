import {RegistrationDialogStore} from "../index";
import {RegistrationStep} from "../../types";

export const createSetRegistrationStepCallback = (registrationDialogStore: RegistrationDialogStore) => (): void => {
    registrationDialogStore.setCurrentStep(RegistrationStep.REGISTER);
};
