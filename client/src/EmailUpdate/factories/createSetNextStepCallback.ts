import {UpdateEmailDialogStore} from "../stores";
import {UpdateEmailStep} from "../types";

export const createSetNextStepCallback = (
    nextStep: UpdateEmailStep
) => (
    updateEmailDialogStore: UpdateEmailDialogStore
) => (): void => {
    updateEmailDialogStore.setCurrentStep(nextStep);
};
