import {action, observable, reaction} from "mobx";
import {
    parseReverseScrollingDirectionOptionFromString,
    parseSendMessageButton,
    parseVirtualScrollElementFromString,
    ReverseScrollDirectionOption,
    SendMessageButton,
    VirtualScrollElement
} from "../types";

export class ChatsPreferencesStore {
    @observable
    enableVirtualScroll: boolean = false;

    @observable
    reverseScrollingDirectionOption: ReverseScrollDirectionOption = ReverseScrollDirectionOption.DO_NOT_REVERSE;

    @observable
    restoredScrollingSpeedCoefficient = 1;

    @observable
    virtualScrollOverscan: number = 120;

    @observable
    enableImagesCaching = false;

    @observable
    virtualScrollElement: VirtualScrollElement = VirtualScrollElement.MESSAGES_LIST;

    @observable
    sendMessageButton: SendMessageButton = SendMessageButton.CTRL_ENTER;

    constructor() {
        if (localStorage.getItem("enableVirtualScroll")) {
            this.enableVirtualScroll = localStorage.getItem("enableVirtualScroll") === "true";
        }

        if (localStorage.getItem("virtualScrollOverscan")) {
            const virtualScrollOverscan = Number(localStorage.getItem("virtualScrollOverscan"));

            if (!isNaN(virtualScrollOverscan) && virtualScrollOverscan >= 0) {
                this.virtualScrollOverscan = virtualScrollOverscan;
            }
        }

        if (localStorage.getItem("reverseScrollDirectionOption")) {
            this.reverseScrollingDirectionOption = parseReverseScrollingDirectionOptionFromString(
                localStorage.getItem("reverseScrollDirectionOption")
            );
        }

        if (localStorage.getItem("reversedScrollSpeedCoefficient")) {
            const reversedScrollSpeedCoefficient = Number(localStorage.getItem("reversedScrollSpeedCoefficient"));

            if (!isNaN(reversedScrollSpeedCoefficient) && reversedScrollSpeedCoefficient > 0) {
                this.restoredScrollingSpeedCoefficient = reversedScrollSpeedCoefficient;
            }
        }

        if (localStorage.getItem("enableImagesCaching")) {
            this.enableImagesCaching = localStorage.getItem("enableImagesCaching" ) === "true";
        }

        if (localStorage.getItem("virtualScrollElement")) {
            this.virtualScrollElement = parseVirtualScrollElementFromString(localStorage.getItem("virtualScrollElement"));
        }

        if (localStorage.getItem("sendMessageButton")) {
            this.sendMessageButton = parseSendMessageButton(localStorage.getItem("sendMessageButton"));
        }

        reaction(
            () => this.virtualScrollElement,
            element => {
                if (element === VirtualScrollElement.WINDOW) {
                    this.setReverseScrollDirectionOption(ReverseScrollDirectionOption.DO_NOT_REVERSE);
                }
            }
        )
    }

    @action
    setEnableVirtualScroll = (enableVirtualScroll: boolean): void => {
        this.enableVirtualScroll = enableVirtualScroll;
        localStorage.setItem("enableVirtualScroll", `${enableVirtualScroll}`);
    };

    @action
    setVirtualScrollOverscan = (virtualScrollOverscan: number): void => {
        if (virtualScrollOverscan >= 0) {
            this.virtualScrollOverscan = virtualScrollOverscan;
            localStorage.setItem("virtualScrollOverscan", `${virtualScrollOverscan}`);
        }
    };

    @action
    setReversedScrollSpeedCoefficient = (reversedScrollSpeedCoefficient: number): void => {
        this.restoredScrollingSpeedCoefficient = reversedScrollSpeedCoefficient;
        localStorage.setItem("reversedScrollSpeedCoefficient", `${reversedScrollSpeedCoefficient}`);
    };

    @action
    setReverseScrollDirectionOption = (reverseScrollOption: ReverseScrollDirectionOption): void => {
        this.reverseScrollingDirectionOption = reverseScrollOption;
        localStorage.setItem("reverseScrollDirectionOption", reverseScrollOption);
    };

    @action
    setEnableImagesCaching = (enableImagesCaching: boolean): void => {
        this.enableImagesCaching = enableImagesCaching;
        localStorage.setItem("enableImagesCaching", `${enableImagesCaching}`);
    };

    @action
    setVirtualScrollElement = (virtualScrollElement: VirtualScrollElement): void => {
        this.virtualScrollElement = virtualScrollElement;
        localStorage.setItem("virtualScrollElement", virtualScrollElement);
    }

    @action
    setSendMessageButton = (sendMessageButton: SendMessageButton): void => {
        this.sendMessageButton = sendMessageButton;
        localStorage.setItem("sendMessageButton", sendMessageButton);
    }
}
