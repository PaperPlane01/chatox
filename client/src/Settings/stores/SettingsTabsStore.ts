import {action, observable} from "mobx";
import {SettingsTab} from "../types";

export class SettingsTabsStore {
    @observable
    activeTab?: SettingsTab = undefined;

    @action
    setActiveTab = (activeTab?: SettingsTab) => {
        this.activeTab = activeTab;
    }
}
