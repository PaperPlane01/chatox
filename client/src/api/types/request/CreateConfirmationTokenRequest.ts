import {ConfirmationTokenAction} from "./ConfirmationTokenAction";

export interface CreateConfirmationTokenRequest {
    password: string,
    actions: ConfirmationTokenAction[]
}
