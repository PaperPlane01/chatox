import {observable, action} from "mobx";

export class AppBarStore {
    @observable
    drawerExpanded: boolean = false;

    @action
    setDrawerExpanded = (drawerExpanded: boolean): void => {
        this.drawerExpanded = drawerExpanded;
    }
}
