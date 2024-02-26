import {makeAutoObservable} from "mobx";
import {parseSendMessageButton, SendMessageButton} from "../types";

export class ChatsPreferencesStore {
    enableVirtualScroll: boolean = false;

    virtualScrollOverscan: number = 120;

    sendMessageButton: SendMessageButton = SendMessageButton.CTRL_ENTER;

    enablePartialVirtualization: boolean = false;

    useSharedWorker: boolean = false;

    sendTypingNotification: boolean = true;

    displayUnreadMessagesCount: boolean = false;

    displayUnreadChatsCount: boolean = false;

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

        if (localStorage.getItem("displayUnreadMessagesCount") !== null) {
            this.displayUnreadMessagesCount = localStorage.getItem("displayUnreadMessagesCount") === "true";
        }

        if (localStorage.getItem("displayUnreadChatsCount") !== null) {
            this.displayUnreadChatsCount = localStorage.getItem("displayUnreadChatsCount") === "true";
        }
    }

    setEnableVirtualScroll = (enableVirtualScroll: boolean): void => {
        this.enableVirtualScroll = enableVirtualScroll;
        localStorage.setItem("enableVirtualScroll", `${enableVirtualScroll}`);
    }

    setVirtualScrollOverscan = (virtualScrollOverscan: number): void => {
        if (virtualScrollOverscan >= 0) {
            this.virtualScrollOverscan = virtualScrollOverscan;
            localStorage.setItem("virtualScrollOverscan", `${virtualScrollOverscan}`);
        }
    }

    setSendMessageButton = (sendMessageButton: SendMessageButton): void => {
        this.sendMessageButton = sendMessageButton;
        localStorage.setItem("sendMessageButton", sendMessageButton);
    }

    setEnablePartialVirtualization = (enablePartialVirtualization: boolean): void => {
        this.enablePartialVirtualization = enablePartialVirtualization;
        localStorage.setItem("enablePartialVirtualization", `${enablePartialVirtualization}`);
    }

    setUseSharedWorker = (useSharedWorker: boolean): void => {
        this.useSharedWorker = useSharedWorker;
        localStorage.setItem("useSharedWorker", `${useSharedWorker}`);
        window.location.reload();
    }

    setSendTypingNotification = (sendTypingNotification: boolean): void => {
        this.sendTypingNotification = sendTypingNotification;
        localStorage.setItem("sendTypingNotification", `${sendTypingNotification}`);
    }

    setDisplayUnreadMessagesCount = (displayUnreadMessagesCount: boolean): void => {
        this.displayUnreadMessagesCount = displayUnreadMessagesCount;
        localStorage.setItem("displayUnreadMessagesCount", `${displayUnreadMessagesCount}`)
    }

    setDisplayUnreadChatsCount = (displayUnreadChatsCount: boolean): void => {
        this.displayUnreadChatsCount = displayUnreadChatsCount;
        localStorage.setItem("displayUnreadChatsCount", `${displayUnreadChatsCount}`);
    }
}
