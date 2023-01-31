import {makeAutoObservable} from "mobx";

export class GlobalBanDetailsDialogStore {
    globalBanId?: string = undefined;

    globalBanDetailsDialogOpen: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }

    setGlobalBanId = (globalBanId?: string): void => {
        this.globalBanId = globalBanId;
    };

    setGlobalBanDetailsDialogOpen = (globalBanDetailsDialogOpen: boolean): void => {
        this.globalBanDetailsDialogOpen = globalBanDetailsDialogOpen;
    };
}
