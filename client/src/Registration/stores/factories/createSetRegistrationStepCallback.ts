import type {RegistrationDialogStore} from "../RegistrationDialogStore";
import {RegistrationStep} from "../../types";

export const createSetRegistrationStepCallback = (registrationDialogStore: RegistrationDialogStore) => (): void => {
    registrationDialogStore.setCurrentStep(RegistrationStep.REGISTER);
};
