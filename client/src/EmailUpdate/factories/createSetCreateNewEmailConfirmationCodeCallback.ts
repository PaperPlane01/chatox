import {createSetNextStepCallback} from "./createSetNextStepCallback";
import {UpdateEmailStep} from "../types";

export const createSetCreateNewEmailConfirmationCodeCallback
    = createSetNextStepCallback(UpdateEmailStep.CREATE_CHANGE_EMAIL_CONFIRMATION_CODE);