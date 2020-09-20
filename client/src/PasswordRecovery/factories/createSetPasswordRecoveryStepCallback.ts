import {PasswordRecoveryDialogStore} from "../stores";
import {PasswordRecoveryStep} from "../types";

export const createSetPasswordRecoveryStepCallback = (passwordRecoveryDialogStore: PasswordRecoveryDialogStore) => (): void => {
    passwordRecoveryDialogStore.setCurrentStep(PasswordRecoveryStep.CHANGE_PASSWORD);
}
