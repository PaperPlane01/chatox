import {RouterStore} from "mobx-router";
import {store} from "./store";
import {IAppState} from "./IAppState";

class RootStore {
    public readonly store: IAppState = store;
    public readonly router: RouterStore<any> = new RouterStore(this);
}

const _rootStore = new RootStore();

//Hack to avoid loss of application state on HMR
if (import.meta.env.DEV && !(window as any).rootStore) {
    (window as any).rootStore = _rootStore;
}

export const rootStore = import.meta.env.DEV && Boolean((window as any).rootStore)
    ? (window as any).rootStore as RootStore
    : _rootStore;