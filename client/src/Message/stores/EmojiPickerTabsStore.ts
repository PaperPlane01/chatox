import {action, observable} from "mobx";

export class EmojiPickerTabsStore {
    @observable
    selectedTab: "emoji" | "stickers" = "emoji";

    @action
    setSelectedTab = (selectedTab: "emoji" | "stickers"): void => {
        this.selectedTab = selectedTab;
    }
}
