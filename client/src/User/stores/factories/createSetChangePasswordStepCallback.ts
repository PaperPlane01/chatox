import {PasswordChangeStepStore} from "../PasswordChangeStepStore";
import {ChangePasswordStep} from "../../types";

export const createSetChangePasswordStepCallback = (passwordChangeStepStore: PasswordChangeStepStore) => (): void => {
    passwordChangeStepStore.setCurrentStep(ChangePasswordStep.CHANGE_PASSWORD);
};
