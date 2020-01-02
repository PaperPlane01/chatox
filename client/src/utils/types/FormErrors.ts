import {Labels} from "../../localization/types";

export type FormErrors<FormType> = {
    [key in keyof FormType]: keyof Labels | undefined
}
