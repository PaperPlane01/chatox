import {makeAutoObservable} from "mobx";

export class AppBarStore {
    drawerExpanded: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }

    setDrawerExpanded = (drawerExpanded: boolean): void => {
        this.drawerExpanded = drawerExpanded;
    };
}
