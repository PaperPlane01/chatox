import {makeAutoObservable} from "mobx";

export class EmojiPickerTabsStore {
    selectedTab: "emoji" | "stickers" = "emoji";

    constructor() {
        makeAutoObservable(this);
    }

    setSelectedTab = (selectedTab: "emoji" | "stickers"): void => {
        this.selectedTab = selectedTab;
    };
}
