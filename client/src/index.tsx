import React from "react";
import {createRoot} from "react-dom/client";
import {Provider} from "mobx-react";
import {setWasmUrl} from "@lottiefiles/dotlottie-react";
import wasmUrl from "@lottiefiles/dotlottie-web/dist/dotlottie-player.wasm?url";
import {App} from "./App";
import {rootStore, store} from "./store";
import {RouterStoreAware} from "./router";
import * as serviceWorker from "./serviceWorker";

setWasmUrl(import.meta.env.VITE_PUBLIC_URL + wasmUrl);

const routerStore = rootStore.router;
const routerStoreAware: RouterStoreAware[] = [
    store.messageCreation,
    store.chatDeletion,
    store.joinChatByInvite,
    store.stickerPackCreation
];

rootStore.startRouter();
rootStore.injectRouterStore(routerStoreAware);

const root = createRoot(document.getElementById("root")!);
root.render(
    <Provider store={routerStore} {...store}>
        <App/>
    </Provider>,
);

if (localStorage.getItem("accessToken")) {
    store.authorization.fetchCurrentUser()
        .then(() => {
            store.chatsOfCurrentUser.fetchChatsOfCurrentUser();
            store.blacklistedUsers.fetchBlacklistedUsers();
        });
} else {
    store.websocket.startListening();
}

if (import.meta.env.DEV) {
    import("mobx").then(mobxModule => (window as any).toJS = mobxModule.toJS) // expose for convenient debugging
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
