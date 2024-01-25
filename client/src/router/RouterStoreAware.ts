import {RouterStore} from "mobx-router";

export interface RouterStoreAware {
    setRouterStore: (routerStore: RouterStore<any>) => void
}
