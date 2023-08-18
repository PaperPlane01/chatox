import {RouterStore} from "mobx-router";
import {store} from "./store";
import {IAppState} from "./IAppState";

class RootStore {
    public readonly store: IAppState = store;
    public readonly router: RouterStore<any> = new RouterStore(this);
}

export const rootStore = new RootStore();