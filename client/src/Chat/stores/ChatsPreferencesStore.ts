import {action, observable} from "mobx";

export class ChatsPreferencesStore {
    @observable
    useVirtualScroll: boolean = false;

    @observable
    virtualScrollOverscan: number = 120;

    constructor() {
        if (localStorage.getItem("useVirtualScroll")) {
            this.useVirtualScroll = localStorage.getItem("useVirtualScroll") === "true";
        }

        if (localStorage.getItem("virtualScrollOverscan")) {
            const virtualScrollOverscan = Number(localStorage.getItem("virtualScrollOverscan"));

            if (!isNaN(virtualScrollOverscan) && virtualScrollOverscan >= 0) {
                this.virtualScrollOverscan = virtualScrollOverscan;
            }
        }
    }

    @action
    setUseVirtualScroll = (useVirtualScroll: boolean): void => {
        this.useVirtualScroll = useVirtualScroll;
        localStorage.setItem("useVirtualScroll", `${useVirtualScroll}`);
    };

    @action
    setVirtualScrollOverscan = (virtualScrollOverscan: number): void => {
        if (virtualScrollOverscan > 0) {
            this.virtualScrollOverscan = virtualScrollOverscan;
            localStorage.setItem("virtualScrollOverscan", `${virtualScrollOverscan}`);
        }
    };
}
