import {makeAutoObservable} from "mobx";
import {parseSendMessageButton, SendMessageButton} from "../types";

export class ChatsPreferencesStore {
    enableVirtualScroll: boolean = false;

    virtualScrollOverscan: number = 120;

    sendMessageButton: SendMessageButton = SendMessageButton.CTRL_ENTER;

    constructor() {
        makeAutoObservable(this);

        if (localStorage.getItem("enableVirtualScroll")) {
            this.enableVirtualScroll = localStorage.getItem("enableVirtualScroll") === "true";
        }

        if (localStorage.getItem("virtualScrollOverscan")) {
            const virtualScrollOverscan = Number(localStorage.getItem("virtualScrollOverscan"));

            if (!isNaN(virtualScrollOverscan) && virtualScrollOverscan >= 0) {
                this.virtualScrollOverscan = virtualScrollOverscan;
            }
        }

        if (localStorage.getItem("sendMessageButton")) {
            this.sendMessageButton = parseSendMessageButton(localStorage.getItem("sendMessageButton"));
        }
    }

    setEnableVirtualScroll = (enableVirtualScroll: boolean): void => {
        this.enableVirtualScroll = enableVirtualScroll;
        localStorage.setItem("enableVirtualScroll", `${enableVirtualScroll}`);
    };

    setVirtualScrollOverscan = (virtualScrollOverscan: number): void => {
        if (virtualScrollOverscan >= 0) {
            this.virtualScrollOverscan = virtualScrollOverscan;
            localStorage.setItem("virtualScrollOverscan", `${virtualScrollOverscan}`);
        }
    };

    setSendMessageButton = (sendMessageButton: SendMessageButton): void => {
        this.sendMessageButton = sendMessageButton;
        localStorage.setItem("sendMessageButton", sendMessageButton);
    };
}
