import {createSetNextStepCallback} from "./createSetNextStepCallback";
import {UpdateEmailStep} from "../types";

export const createSetCreateNewEmailConfirmationCodeCallback
    = createSetNextStepCallback(UpdateEmailStep.CREATE_NEW_EMAIL_CONFIRMATION_CODE);