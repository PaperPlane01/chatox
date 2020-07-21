import {Language} from "../../../localization/types";

export interface CreateEmailVerificationRequest {
    email: string,
    language: Language
}
