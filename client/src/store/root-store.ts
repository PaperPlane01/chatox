import {RouterStore, startRouter} from "mobx-router";
import {parse} from "query-string";
import {store} from "./store";
import {IAppState} from "./IAppState";
import {RouterStoreAware, Routes} from "../router";

class RootStore {
    public readonly store: IAppState = store;
    public readonly router: RouterStore<any> = new RouterStore(this);

    public startRouter = (): void => {
        startRouter(Routes, this, {
            notfound: () => {
                if (window.location.href.includes(`${import.meta.env.VITE_PUBLIC_URL}/oauth/google/`)) {
                    const queryStringParameters = parse(
                        window.location.href.substring(`${import.meta.env.VITE_PUBLIC_URL}/oauth/google/`.length)
                    );
                    const access_token = queryStringParameters.access_token ? `${queryStringParameters.access_token}` : "";
                    this.router.goTo(Routes.googleAuthentication, {}, {access_token});
                } else {
                    this.router.goTo(Routes.notFound);
                }
            }
        });
    }

    restartRouter = (): void => {
        this.startRouter();
    }

    injectRouterStore = (routerStoreAwares: RouterStoreAware[]): void => {
        routerStoreAwares.forEach(routerStoreAware => routerStoreAware.setRouterStore(this.router));
    }
}

const _rootStore = new RootStore();

//Hack to avoid loss of application state on HMR
if (import.meta.env.DEV && !(window as any).rootStore) {
    (window as any).rootStore = _rootStore;
}

export const rootStore = import.meta.env.DEV && Boolean((window as any).rootStore)
    ? (window as any).rootStore as RootStore
    : _rootStore;