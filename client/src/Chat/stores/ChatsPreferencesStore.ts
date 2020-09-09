import {action, observable} from "mobx";
import {parseReverseScrollingDirectionOptionFromString, ReverseScrollDirectionOption} from "../types";

export class ChatsPreferencesStore {
    @observable
    enableVirtualScroll: boolean = false;

    @observable
    useSimplifiedGalleryForVirtualScroll: boolean = true;

    @observable
    reverseScrollingDirectionOption: ReverseScrollDirectionOption = ReverseScrollDirectionOption.DO_NOT_REVERSE;

    @observable
    restoredScrollingSpeedCoefficient = 1;

    @observable
    virtualScrollOverscan: number = 120;

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

        if (localStorage.getItem("useSimplifiedGalleryForVirtualScroll")) {
            this.useSimplifiedGalleryForVirtualScroll = localStorage.getItem("useSimplifiedGalleryForVirtualScroll") === "true";
        }

        if (localStorage.getItem("reversedScrollSpeedCoefficient")) {
            const reversedScrollSpeedCoefficient = Number(localStorage.getItem("reversedScrollSpeedCoefficient"));

            if (!isNaN(reversedScrollSpeedCoefficient) && reversedScrollSpeedCoefficient > 0) {
                this.restoredScrollingSpeedCoefficient = reversedScrollSpeedCoefficient;
            }
        }
    }

    @action
    setEnableVirtualScroll = (enableVirtualScroll: boolean): void => {
        this.enableVirtualScroll = enableVirtualScroll;
        localStorage.setItem("enableVirtualScroll", `${enableVirtualScroll}`);
    };

    @action
    setVirtualScrollOverscan = (virtualScrollOverscan: number): void => {
        if (virtualScrollOverscan > 0) {
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
    setUseSimplifiedGalleryForVirtualScroll = (useSimplifiedGalleryForVirtualScroll: boolean): void => {
        this.useSimplifiedGalleryForVirtualScroll = useSimplifiedGalleryForVirtualScroll;
        localStorage.setItem("useSimplifiedGalleryForVirtualScroll", `${useSimplifiedGalleryForVirtualScroll}`);
    };

    @action
    setReverseScrollDirectionOption = (reverseScrollOption: ReverseScrollDirectionOption): void => {
        this.reverseScrollingDirectionOption = reverseScrollOption;
        localStorage.setItem("reverseScrollDirectionOption", reverseScrollOption);
    };
}
