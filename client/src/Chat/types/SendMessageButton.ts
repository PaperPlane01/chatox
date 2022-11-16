import {isDefined} from "../../utils/object-utils";

export enum SendMessageButton {
    CTRL_ENTER = "CTRL_ENTER",
    ENTER = "ENTER"
}

export const parseSendMessageButton = (sendMessageButtonString: string | null | undefined): SendMessageButton => {
    if (!isDefined(sendMessageButtonString)) {
        return SendMessageButton.CTRL_ENTER;
    }

    switch (sendMessageButtonString.trim().toUpperCase()) {
        default:
        case "CTRL_ENTER":
            return SendMessageButton.CTRL_ENTER;
        case "ENTER":
            return SendMessageButton.ENTER;
    }
}