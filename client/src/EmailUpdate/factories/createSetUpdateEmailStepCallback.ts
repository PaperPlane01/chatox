import {createSetNextStepCallback} from "./createSetNextStepCallback";
import {UpdateEmailStep} from "../types";

export const createSetUpdateEmailStepCallback = createSetNextStepCallback(UpdateEmailStep.UPDATE_EMAIL);
