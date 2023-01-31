import {makeAutoObservable} from "mobx";
import {SettingsTab} from "../types";

export class SettingsTabsStore {
    activeTab?: SettingsTab = undefined;

    constructor() {
       makeAutoObservable(this);
    }

    setActiveTab = (activeTab?: SettingsTab) => {
        this.activeTab = activeTab;
    };
}
