import {makeAutoObservable} from "mobx";
import {parseSendMessageButton, SendMessageButton} from "../types";

export class ChatsPreferencesStore {
    enableVirtualScroll: boolean = false;

    virtualScrollOverscan: number = 120;

    sendMessageButton: SendMessageButton = SendMessageButton.CTRL_ENTER;

    enablePartialVirtualization: boolean = false;

    useSharedWorker: boolean = false;

    sendTypingNotification: boolean = true;

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

        if (localStorage.getItem("enablePartialVirtualization")) {
            this.enablePartialVirtualization = localStorage.getItem("enablePartialVirtualization") === "true";
        }

        if (localStorage.getItem("useSharedWorker")) {
            this.useSharedWorker = localStorage.getItem("useSharedWorker") === "true";
        }

        if (localStorage.getItem("sendTypingNotification") !== null) {
            this.sendTypingNotification = localStorage.getItem("sendTypingNotification") === "true";
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

    setEnablePartialVirtualization = (enablePartialVirtualization: boolean): void => {
        this.enablePartialVirtualization = enablePartialVirtualization;
        localStorage.setItem("enablePartialVirtualization", `${enablePartialVirtualization}`);
    };

    setUseSharedWorker = (useSharedWorker: boolean): void => {
        this.useSharedWorker = useSharedWorker;
        localStorage.setItem("useSharedWorker", `${useSharedWorker}`);
        window.location.reload();
    }

    setSendTypingNotification = (sendTypingNotification: boolean): void => {
        this.sendTypingNotification = sendTypingNotification;
        localStorage.setItem("sendTypingNotification", `${sendTypingNotification}`);
    }
}
