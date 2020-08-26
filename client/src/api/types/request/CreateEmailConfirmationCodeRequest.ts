import {EmailConfirmationCodeType} from "./EmailConfirmationCodeType";
import {Language} from "../../../localization/types";

export interface CreateEmailConfirmationCodeRequest {
    email?: string,
    language: Language,
    type: EmailConfirmationCodeType
}
