import {observable, action} from "mobx";

export class GlobalBanDetailsDialogStore {
    @observable
    globalBanId?: string = undefined;

    @observable
    globalBanDetailsDialogOpen: boolean = false;

    @action
    setGlobalBanId = (globalBanId?: string): void => {
        this.globalBanId = globalBanId;
    }

    @action
    setGlobalBanDetailsDialogOpen = (globalBanDetailsDialogOpen: boolean): void => {
        this.globalBanDetailsDialogOpen = globalBanDetailsDialogOpen;
    }
}
