import {makeAutoObservable, reaction} from "mobx";
import {
    parseReverseScrollingDirectionOptionFromString,
    parseSendMessageButton,
    parseVirtualScrollElementFromString,
    ReverseScrollDirectionOption,
    SendMessageButton,
    VirtualScrollElement
} from "../types";

export class ChatsPreferencesStore {
    enableVirtualScroll: boolean = false;

    reverseScrollingDirectionOption: ReverseScrollDirectionOption = ReverseScrollDirectionOption.DO_NOT_REVERSE;

    restoredScrollingSpeedCoefficient = 1;

    virtualScrollOverscan: number = 120;

    enableImagesCaching = false;

    virtualScrollElement: VirtualScrollElement = VirtualScrollElement.MESSAGES_LIST;

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

    setReversedScrollSpeedCoefficient = (reversedScrollSpeedCoefficient: number): void => {
        this.restoredScrollingSpeedCoefficient = reversedScrollSpeedCoefficient;
        localStorage.setItem("reversedScrollSpeedCoefficient", `${reversedScrollSpeedCoefficient}`);
    };

    setReverseScrollDirectionOption = (reverseScrollOption: ReverseScrollDirectionOption): void => {
        this.reverseScrollingDirectionOption = reverseScrollOption;
        localStorage.setItem("reverseScrollDirectionOption", reverseScrollOption);
    };

    setEnableImagesCaching = (enableImagesCaching: boolean): void => {
        this.enableImagesCaching = enableImagesCaching;
        localStorage.setItem("enableImagesCaching", `${enableImagesCaching}`);
    };

    setVirtualScrollElement = (virtualScrollElement: VirtualScrollElement): void => {
        this.virtualScrollElement = virtualScrollElement;
        localStorage.setItem("virtualScrollElement", virtualScrollElement);
    };

    setSendMessageButton = (sendMessageButton: SendMessageButton): void => {
        this.sendMessageButton = sendMessageButton;
        localStorage.setItem("sendMessageButton", sendMessageButton);
    };
}
